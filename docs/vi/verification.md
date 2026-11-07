# Kiểm chứng mã nguồn và RTL FPGA

[English](../en/verification.md) · Tiếng Việt

[Mục lục tài liệu](index.md)

Dùng môi trường mới nằm ngoài mọi bản sao kho mã. CI hiện tại dùng Node 26 và Python 3.14. Chọn đúng wheel Contracts 0.1.2 và bộ cấp phát DEV theo mã băm. Bộ phụ thuộc khóa bằng mã băm có `pyslang==12.0.0`. Dùng OSS CAD Suite ngày 2026-10-26 đã ghim, cùng đúng bản dựng Icarus và vvp đi kèm.

Chạy trong PowerShell tại kho FPGA. Thay chỗ giữ chỗ cho manifest và tệp nén bằng đường dẫn tuyệt đối đã rà soát. Khi bỏ `--archive`, trình cài đặt tải bản đã ghim.

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

Sau các bước kiểm tra, dựng gói mã nguồn vào phiên do mình sở hữu.

~~~powershell
$archive = Join-Path $bootstrap.session 'cirnet-fpga-scaffold-0.1.2.tar.gz'
python -B scripts/build_source.py --output $archive --provenance integration/source-provenance.json
~~~

Gói chứa danh mục tệp có thể tái lập và nguồn gốc trong `fpga-artifact.json`. So sánh hai lần dựng từ đầu vào giống hệt nhau. Khi phát hành, dùng commit sạch thực tế và ghi mã SHA256. Gói `v0.1.1` đã công bố giữ nguyên định danh ban đầu. Kiểm tra dữ liệu chẩn đoán trước khi dùng cơ chế dọn dẹp có kiểm tra quyền sở hữu phiên của bộ cấp phát.

[Quy trình CI](../../.github/workflows/fpga.yml) chạy cổng kiểm chứng Linux. [Kết quả theo ngày](../en/history/verification/2026-11-05-fpga-verification.md#2026-11-05-fpga-012-candidate) ghi nhận bản dựng đã thử và giới hạn của phép kiểm tra. Kiểm chứng phần mềm xác nhận hành vi điều khiển trừu tượng. Nạp cấu hình bo mạch, phân chân, xác nhận đáp ứng thời gian và đánh giá điện cần kiểm tra riêng.
