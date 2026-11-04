"""Environment compatibility needed before the Contracts wheel is installed.

Product code uses contracts.runtime_config. Bootstrap cannot import a dependency
it is about to install; this adapter only translates the two setting prefixes.
"""
import os


def getenv(name, default=None, environ=None):
    values = os.environ if environ is None else environ
    suffix = name.removeprefix('CIRNET_').removeprefix('NETCIRCUIT_')
    if name.startswith(('CIRNET_', 'NETCIRCUIT_')):
        return values.get('CIRNET_' + suffix, values.get('NETCIRCUIT_' + suffix, default))
    return values.get(name, default)


def export_environment(environ=None):
    values = dict(os.environ if environ is None else environ)
    suffixes = {key.split('_', 1)[1] for key in values if key.startswith(('CIRNET_', 'NETCIRCUIT_'))}
    for suffix in suffixes:
        value = getenv('CIRNET_' + suffix, environ=values)
        values['CIRNET_' + suffix] = values['NETCIRCUIT_' + suffix] = value
    return values
