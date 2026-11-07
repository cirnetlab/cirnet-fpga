# Kiểm chứng mã nguồn và RTL FPGA

[English](../en/verification.md) · Tiếng Việt

[Mục lục tài liệu](index.md)

Dùng môi trường mới nằm ngoài mọi bản sao kho mã. CI hiện tại dùng Node 26 và Python 3.14. Chọn đúng wheel Contracts 0.1.2 và bộ cấp phát DEV theo mã băm. Bộ phụ thuộc khóa bằng mã băm có `pyslang==12.0.0`. Dùng OSS CAD Suite ngày 2026-10-26 đã ghim, cùng đúng bản dựng Icarus và vvp đi kèm.

## Kiểm chứng bản xuất sạch

Bắt đầu trong PowerShell 7 tại checkout FPGA. Thay chỗ giữ chỗ cho manifest và tệp nén bằng đường dẫn tuyệt đối đã rà soát. Khi bỏ `--archive`, trình cài đặt tải bản đã ghim.

Bộ pytest có các ca dựng gói mã nguồn. Trình đóng gói đối chiếu mọi mục ở gốc checkout với danh sách đầu vào, kể cả các mục Git bỏ qua như `.superpowers/`. Khởi tạo từ checkout để giữ ngữ cảnh Git, sau đó chạy pytest và trình đóng gói từ bản xuất sạch của commit đã rà soát trong phiên do mình sở hữu. Bản xuất chỉ chứa các tệp đã commit. Ghi riêng đầu vào khi dùng kết quả kiểm chứng cho ứng viên có thay đổi chưa commit.

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
~~~

Cổng pytest gọi `scripts/check_rtl.py` và kiểm tra kết quả. Để chạy riêng bước RTL, dùng `python -B scripts/check_rtl.py --toolchain-root $env:CIRNET_FPGA_TOOLCHAIN_ROOT`.

Cả `LAB_FIRST_RTL_PASS` và `PERMIT_MATRIX_RTL_PASS` phải đến từ lần chạy mô phỏng thật. Cổng kiểm chứng xác thực đầy đủ tệp thực thi và phụ thuộc của bộ công cụ, đồng thời kiểm tra cả hai mô-đun cấp cao. Công cụ thiếu hoặc sai phiên bản làm cổng kiểm chứng thất bại. Chỉ biên dịch, phân tích cú pháp hay triển khai cấu trúc RTL chưa đủ để xác nhận hành vi. Bộ kiểm thử gốc và ma trận điều kiện bao quát reset, mất điều kiện cho phép, lỗi và watchdog, dừng an toàn và thiết bị đo chưa khả dụng. Xem [hướng dẫn testbench](../../fpga/simulation/README.md).

## Dựng gói mã nguồn

Từ cùng bản xuất, tạo bản sao dữ liệu nguồn gốc ở ngoài checkout, điền commit đã xuất rồi dựng gói hai lần. Giữ nguyên dữ liệu nguồn gốc đã ghi trong kho.

~~~powershell
$provenance = Get-Content -LiteralPath integration/source-provenance.json -Raw | ConvertFrom-Json
$provenance.revision = $revision
$provenance.uncommittedMigration = $false
$provenancePath = Join-Path $bootstrap.session 'export-provenance.json'
$provenance | ConvertTo-Json | Set-Content -LiteralPath $provenancePath -Encoding utf8NoBOM
$archive = Join-Path $bootstrap.session 'cirnet-fpga-scaffold-0.1.2.tar.gz'
$rebuild = Join-Path $bootstrap.session 'rebuilt.tar.gz'
python -B scripts/build_source.py --output $archive --provenance $provenancePath
python -B scripts/build_source.py --output $rebuild --provenance $provenancePath
$digest = (Get-FileHash -LiteralPath $archive -Algorithm SHA256).Hash
if ($digest -ne (Get-FileHash -LiteralPath $rebuild -Algorithm SHA256).Hash) {
    throw 'Source archive rebuild differs.'
}
$digest
Pop-Location
~~~

Gói chứa danh mục tệp có thể tái lập và nguồn gốc trong `fpga-artifact.json`. Khi phát hành, ghi commit sạch dùng để dựng và mã SHA-256 của gói. Các gói đã công bố giữ nguyên định danh đã ghi. Kiểm tra dữ liệu chẩn đoán trước khi dùng cơ chế dọn dẹp có kiểm tra quyền sở hữu phiên của bộ cấp phát.

[Quy trình CI](../../.github/workflows/fpga.yml) chạy cổng kiểm chứng Linux. [Kết quả theo ngày](../en/history/verification/2026-11-05-fpga-verification.md#2026-11-05-fpga-012-candidate) ghi nhận bản dựng đã thử và giới hạn của phép kiểm tra. Kiểm chứng phần mềm xác nhận hành vi điều khiển trừu tượng. Nạp cấu hình bo mạch, phân chân, xác nhận đáp ứng thời gian và đánh giá điện cần kiểm tra riêng.
