# Kiểm chứng mã nguồn và RTL FPGA

[English](../en/verification.md) · Tiếng Việt

[Mục lục tài liệu](index.md)

## Dựng ứng viên mã nguồn native

Dùng Node 26 và Git. Trích mô-đun bộ cấp phát từ gói DEV npm trong [khóa artifact](../../integration/contracts-version.json). Đối chiếu hai mã SHA-256 và đặt `CIRNET_ARTIFACTS_CLI` thành đường dẫn tuyệt đối của mô-đun đã kiểm chứng. Trình đóng gói Node kiểm tra lại mã băm trước khi nạp mô-đun.

~~~powershell
$env:CIRNET_ARTIFACTS_SESSION = node $env:CIRNET_ARTIFACTS_CLI
node --test tests/build-source.test.mjs
node scripts/build-source.mjs --output (Join-Path $env:CIRNET_ARTIFACTS_SESSION 'cirnet-fpga-scaffold-0.2.2-native-source.tar.gz')
~~~

Chạy từ checkout FPGA. Với bản xuất mã nguồn, dùng ngữ cảnh bộ cấp phát của checkout gốc và `--provenance` ghi đúng revision cùng trạng thái thay đổi. Biên nhận ghi SHA-256 của gói, revision, trạng thái thay đổi và phiên bản Node/zlib. Gói chỉ chứa khung mã nguồn với định danh giao thức logic và bản đồ thanh ghi hiện có. CI đóng gói ứng viên trong job Windows riêng. Khóa phát hành hiện hành tiếp tục xác định gói lịch sử.

## Kiểm chứng RTL tách biệt

Dùng môi trường mới nằm ngoài mọi bản sao kho mã. CI RTL hiện tại dùng Node 26 và Python 3.14. Chọn đúng wheel Contracts 0.1.2 và bộ cấp phát DEV theo mã băm. Bộ phụ thuộc khóa bằng mã băm có `pyslang==12.0.0`. Dùng OSS CAD Suite ngày 2026-10-26 đã ghim, cùng đúng bản dựng Icarus và vvp đi kèm.

## Kiểm chứng bản xuất sạch

Bắt đầu trong PowerShell 7 tại checkout FPGA. Thay chỗ giữ chỗ cho manifest và tệp nén bằng đường dẫn tuyệt đối đã rà soát. Khi bỏ `--archive`, trình cài đặt tải bản đã ghim.

Khởi tạo từ checkout để giữ ngữ cảnh Git, sau đó chạy pytest từ bản xuất sạch của commit đã rà soát trong phiên do mình sở hữu. Bản xuất chỉ chứa các tệp đã commit. Ghi riêng đầu vào khi dùng kết quả kiểm chứng cho ứng viên có thay đổi chưa commit.

Chạy các lệnh theo thứ tự và dừng khi có lỗi đầu tiên.

~~~powershell
$env:CIRNET_CONTRACTS_ARTIFACT_MANIFEST = 'C:/absolute/contracts/artifacts.json'
$bootstrap = python -B -c "from scripts.bootstrap_contract_tools import bootstrap; import json; print(json.dumps(bootstrap()))" | Select-Object -Last 1 | ConvertFrom-Json
if ($LASTEXITCODE -ne 0 -or -not $bootstrap.session -or -not $bootstrap.context) {
    throw 'Could not allocate a verification session.'
}
$env:CIRNET_ARTIFACTS_SESSION = $bootstrap.session
$env:CIRNET_ARTIFACTS_CONTEXT = $bootstrap.context | ConvertTo-Json -Compress -Depth 10
$env:TMP = $env:TEMP = $env:TMPDIR = $bootstrap.session
$env:PIP_CACHE_DIR = Join-Path $bootstrap.session 'pip-cache'
$env:PYTHONDONTWRITEBYTECODE = '1'
$revision = git rev-parse --verify HEAD
$sourceTar = Join-Path $bootstrap.session 'tracked-source.tar'
$export = Join-Path $bootstrap.session 'source-export'
New-Item -ItemType Directory -Path $export | Out-Null
git archive --format=tar "--output=$sourceTar" $revision
tar -xf $sourceTar -C $export
Push-Location -LiteralPath $export
$wheelhouse = Join-Path $bootstrap.session 'wheelhouse'
python -B -m pip download --require-hashes --only-binary=:all: -r requirements-verification.lock --dest $wheelhouse
python -B -m pip install --require-hashes --only-binary=:all: --no-index --find-links $wheelhouse -r requirements-verification.lock
python -B scripts/install_contracts.py --manifest $env:CIRNET_CONTRACTS_ARTIFACT_MANIFEST
python -B -m pip check
$tool = python -B scripts/install_toolchain.py --archive C:/absolute/oss-cad-suite-archive
$env:CIRNET_FPGA_TOOLCHAIN_ROOT = ($tool -join [Environment]::NewLine | ConvertFrom-Json).root
python -B -m pytest -q --basetemp (Join-Path $bootstrap.session 'pytest')
Pop-Location
~~~

Cổng pytest gọi `scripts/check_rtl.py` và kiểm tra kết quả. Để chạy riêng bước RTL, dùng `python -B scripts/check_rtl.py --toolchain-root $env:CIRNET_FPGA_TOOLCHAIN_ROOT`.

Cả `LAB_FIRST_RTL_PASS` và `PERMIT_MATRIX_RTL_PASS` phải đến từ lần chạy mô phỏng thật. Cổng kiểm chứng xác thực đầy đủ tệp thực thi và phụ thuộc của bộ công cụ, đồng thời kiểm tra cả hai mô-đun cấp cao. Công cụ thiếu hoặc sai phiên bản làm cổng kiểm chứng thất bại. Chỉ biên dịch, phân tích cú pháp hay triển khai cấu trúc RTL chưa đủ để xác nhận hành vi. Bộ kiểm thử gốc và ma trận điều kiện bao quát reset, mất điều kiện cho phép, lỗi và watchdog, dừng an toàn và thiết bị đo chưa khả dụng. Xem [hướng dẫn testbench](../../fpga/simulation/README.md).

Kiểm tra dữ liệu chẩn đoán trước khi dùng cơ chế dọn dẹp có kiểm tra quyền sở hữu phiên của bộ cấp phát.

[Quy trình CI](../../.github/workflows/fpga.yml) chạy cổng kiểm chứng Linux. [Kết quả theo ngày](../en/history/verification/2026-11-05-fpga-verification.md#2026-11-05-fpga-012-candidate) ghi nhận bản dựng đã thử và giới hạn của phép kiểm tra. Kiểm chứng phần mềm xác nhận hành vi điều khiển trừu tượng. Nạp cấu hình bo mạch, phân chân, xác nhận đáp ứng thời gian và đánh giá điện cần kiểm tra riêng.
