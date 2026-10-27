#!/usr/bin/env python3
"""Upload a built static site to gh-pages. Does not change DNS or enable Pages."""
import os
from pathlib import Path
import subprocess
import tempfile

ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / 'dist'


def git(*args, cwd=ROOT, process_env=None):
    return subprocess.check_output(
        ['git', *args], cwd=cwd, env=process_env, text=True
    ).strip()


def main():
    if not (DIST / 'index.html').is_file():
        raise SystemExit('Build missing. Run npm run build first.')
    if (DIST / 'CNAME').read_text().strip() != 'kirillbielokon.com':
        raise SystemExit('Unexpected deployment domain; inspect dist/CNAME.')
    if not (DIST / '.nojekyll').is_file():
        raise SystemExit('Missing dist/.nojekyll.')
    if any(path.is_symlink() for path in DIST.rglob('*')):
        raise SystemExit('Build contains symlinks; inspect before publishing.')

    # Preserve the current index, checkout, and source branch. A dedicated
    # temporary index builds the publication tree directly from dist/.
    with tempfile.TemporaryDirectory(prefix='portfolio-pages-') as temp:
        process_env = os.environ.copy()
        process_env['GIT_INDEX_FILE'] = str(Path(temp) / 'index')
        git_args = ['--git-dir', str(ROOT / '.git'), '--work-tree', str(DIST)]
        git(*git_args, 'read-tree', '--empty', cwd=DIST, process_env=process_env)
        git(*git_args, 'add', '--all', '--', '.', cwd=DIST, process_env=process_env)
        tree = git(*git_args, 'write-tree', cwd=DIST, process_env=process_env)

    remote = git('ls-remote', '--heads', 'origin', 'refs/heads/gh-pages')
    parent = None
    if remote:
        parent = remote.split()[0]
        git('fetch', '--no-tags', 'origin', 'refs/heads/gh-pages')
        if git('rev-parse', 'FETCH_HEAD') != parent:
            raise SystemExit('Remote changed during preparation; rerun.')
        if git('rev-parse', f'{parent}^{{tree}}') == tree:
            print(f'gh-pages already contains this build: {parent}')
            return

    args = ['-c', 'user.name=Codex', '-c', 'user.email=codex@openai.com',
            'commit-tree', tree]
    if parent:
        args.extend(['-p', parent])
    args.extend(['-m', 'Publish portfolio static build for kirillbielokon.com'])
    commit = git(*args)
    # No force push: reject concurrent updates instead of overwriting them.
    subprocess.run(['git', 'push', 'origin', f'{commit}:refs/heads/gh-pages'],
                   cwd=ROOT, check=True)
    actual = git('ls-remote', '--heads', 'origin', 'refs/heads/gh-pages').split()[0]
    if actual != commit:
        raise SystemExit('Remote verification failed; inspect gh-pages.')
    print(f'Static build uploaded and verified: {commit}')
    print('GitHub Pages activation and IONOS DNS are separate required steps.')


if __name__ == '__main__':
    main()
