"""Install the exact selected Contracts wheel after the locked dependency closure."""
import argparse
import os
from pathlib import Path
import subprocess
import sys

from artifact_download import download_artifact
from artifact_paths import artifact_directory
from contracts_artifact import VERSION, installed_contracts, selected_wheel_details, verified_wheel_name, verify_selected_install


def main(argv=None):
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--manifest')
    args=parser.parse_args(argv)
    if args.manifest or os.environ.get('NETCIRCUIT_CONTRACTS_ARTIFACT_MANIFEST'):
        wheel,digest=selected_wheel_details(args.manifest)
        name=verified_wheel_name(wheel.read_bytes(),digest)
    else:
        url=os.environ.get('NETCIRCUIT_CONTRACTS_WHEEL_URL')
        digest=os.environ.get('NETCIRCUIT_CONTRACTS_WHEEL_SHA256')
        if not url or not digest:
            parser.error('Select an immutable Contracts manifest or exact HTTPS URL/SHA256.')
        payload=download_artifact(url,digest)
        name=verified_wheel_name(payload,digest)
        wheel=artifact_directory('fpga-leaf-contracts')/f"{name.replace('-', '_')}-{VERSION}-py3-none-any.whl"
        wheel.write_bytes(payload)
    if installed_contracts().keys() - {name}:
        raise ValueError('The other Contracts distribution is already installed. Install the selected wheel in a fresh environment.')
    runtime=artifact_directory('fpga-leaf-contract-install')
    subprocess.run([sys.executable,'-B','-m','pip','install','--no-deps','--force-reinstall',
        '--cache-dir',str(artifact_directory('fpga-leaf-pip-cache')),str(wheel)],check=True,
        env={**os.environ,'TEMP':str(runtime),'TMP':str(runtime),'TMPDIR':str(runtime),
             'PYTHONDONTWRITEBYTECODE':'1'})
    print(verify_selected_install(wheel,digest))


if __name__=='__main__':
    main()
