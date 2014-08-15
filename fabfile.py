import os

import fabdeploytools.envs
from fabric.api import env, lcd, local, task
from fabdeploytools import helpers

import deploysettings as settings

env.key_filename = settings.SSH_KEY
fabdeploytools.envs.loadenv(settings.CLUSTER)

ROOT, FIREPLACE = helpers.get_app_dirs(__file__)
COMMONPLACE = '%s/node_modules/commonplace/bin' % FIREPLACE
GRUNT = '%s/node_modules/grunt-cli/bin' % FIREPLACE

if settings.ZAMBONI_DIR:
    ZAMBONI = '%s/zamboni' % settings.ZAMBONI_DIR
    ZAMBONI_PYTHON = '%s/venv/bin/python' % settings.ZAMBONI_DIR

os.environ['DJANGO_SETTINGS_MODULE'] = 'settings_local_mkt'
os.environ["PATH"] += os.pathsep + os.pathsep.join([COMMONPLACE, GRUNT])

PACKAGE_NAME = getattr(settings, 'PACKAGE_NAME', 'marketplace')


@task
def pre_update(ref):
    with lcd(FIREPLACE):
        local('git fetch')
        local('git fetch -t')
        local('git reset --hard %s' % ref)


@task
def update():
    with lcd(FIREPLACE):
        local('npm install')
        local('npm install --force commonplace@0.4.2')

        if settings.ZAMBONI_DIR:
            package_update()

        local('commonplace includes')
        local('commonplace langpacks')


@task
def package_update():
    if 'feed' in PACKAGE_NAME:
        build_package('feed_%s' % settings.ENV)
        upload_package(fireplace_package(settings.ENV), PACKAGE_NAME)

        # build prod feed package on -dev
        if settings.ENV is 'dev':
            build_package('feed_prod')
            upload_package(fireplace_package('prod'), 'feed-prod')
    else:
        build_package(settings.ENV)
        upload_package(fireplace_package(settings.ENV), PACKAGE_NAME)


@task
def deploy():
    helpers.deploy(name=settings.PROJECT_NAME,
                   app_dir='fireplace',
                   env=settings.ENV,
                   cluster=settings.CLUSTER,
                   domain=settings.DOMAIN,
                   root=ROOT)


@task
def pre_update_latest_tag():
    current_tag_file = os.path.join(FIREPLACE, '.tag')
    latest_tag = helpers.git_latest_tag(FIREPLACE)
    with open(current_tag_file, 'r+') as f:
        if f.read() == latest_tag:
            print 'Environment is at %s' % latest_tag
        else:
            pre_update(latest_tag)
            f.seek(0)
            f.write(latest_tag)
            f.truncate()


@task
def build_package(package_env):
    with lcd(FIREPLACE):
        local('make package_%s' % package_env)


@task
def upload_package(fireplace_package, package_name):
    with lcd(ZAMBONI):
        local('%s manage.py upload_new_marketplace_package %s %s '
              % (ZAMBONI_PYTHON, package_name, fireplace_package))


def fireplace_package(env):
    return '%s/package/archives/latest_%s.zip' % (FIREPLACE, env)
