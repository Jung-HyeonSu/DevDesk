# WebAssembly attributions

- `tree-sitter-perl.wasm` is built from [`tree-sitter-perl` 2.0.0](https://github.com/tree-sitter-perl/tree-sitter-perl), licensed under MIT. Its license text is in `tree-sitter-perl-MIT.txt`.
- `tree-sitter-runtime.wasm` is copied from [`web-tree-sitter` 0.27.1](https://github.com/tree-sitter/tree-sitter/tree/master/lib/binding_web), licensed under MIT. Its license text is in `web-tree-sitter-MIT.txt`.

To rebuild the Perl grammar artifact, install the project dependencies and run `npm run build:perl-wasm`. The Tree-sitter CLI may download the WASI SDK and Binaryen required for this build.
