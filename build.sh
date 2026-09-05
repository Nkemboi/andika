#!/usr/bin/env bash
# Assemble the self-contained single-file app from src/
set -e
cd "$(dirname "$0")"

python3 - <<'PYEOF'
import pathlib
root = pathlib.Path('.')
tpl = (root/'src/01-head.html').read_text()
css = (root/'src/styles.css').read_text()
js_files = [
 'src/js/00-assets.js',
 'src/js/01-utils.js',
 'src/js/02-store.js',
 'src/js/03-generator.js',
 'src/js/04-paybridge.js',
 'src/js/05-social.js',
 'src/js/06-recommend.js',
 'src/js/07-components.js',
 'src/js/08-chrome.js',
 'src/js/09-router.js',
 'src/js/10-pages-marketing.js',
 'src/js/11-pages-reco-contact.js',
 'src/js/12-pages-auth.js',
 'src/js/13-pages-checkout.js',
 'src/js/14-pages-dashboard.js',
 'src/js/16-scheduler.js',
 'src/js/15-main.js'
]
js = '\n;\n'.join((root/f).read_text() for f in js_files)
out = tpl.replace('/* __STYLES__ */', css).replace('/* __SCRIPTS__ */', js)
(root/'index.html').write_text(out)
print('index.html written:', len(out), 'bytes')
PYEOF

echo "Done."
