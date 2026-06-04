/**
 * A jscodeshift transform that:
 *  - Strips duplicate default imports from @mui/material/*
 *  - Replaces <Modal>+<Sheet> with <Dialog> wrapper
 *  - Rewrites <Input> to <TextField variant="outlined">
 *  - Ensures required MUI named imports are present
 */
export default function transformer(file, api) {
    const j = api.jscodeshift;
    const root = j(file.source);
  
    // 1. Collect existing named imports from "@mui/material"
    const materialImport = root
      .find(j.ImportDeclaration, { source: { value: "@mui/material" } });
  
    // 2. Remove standalone default imports from @mui/material/Dialog, ... etc.
    root
      .find(j.ImportDeclaration)
      .filter(path => path.node.source.value.startsWith("@mui/material/"))
      .filter(path => path.node.specifiers.every(s => s.type === "ImportDefaultSpecifier"))
      .remove();
  
    // 3. Replace any <Modal>...</Modal> + nested <Sheet>...</Sheet> with single <Dialog>
    root
      .find(j.JSXElement, { openingElement: { name: { name: "Modal" } } })
      .forEach(path => {
        // unwrap its children, replace Modal with Dialog, remove Sheet
        const dialog = j.jsxElement(
          j.jsxOpeningElement(j.jsxIdentifier("Dialog"), [
            j.jsxAttribute(j.jsxIdentifier("open"), j.jsxExpressionContainer(j.identifier("open"))),
            j.jsxAttribute(j.jsxIdentifier("onClose"), j.jsxExpressionContainer(j.identifier("onClose"))),
            j.jsxAttribute(j.jsxIdentifier("fullWidth")),
            j.jsxAttribute(j.jsxIdentifier("maxWidth"), j.literal("sm"))
          ]),
          j.jsxClosingElement(j.jsxIdentifier("Dialog")),
          // flatten children, dropping any <Sheet> wrapper
          path.node.children
            .filter(n => n.type !== "JSXElement" || n.openingElement.name.name !== "Sheet")
            .flatMap(n => 
               n.type === "JSXElement" && n.openingElement.name.name === "Sheet"
                 ? n.children 
                 : [n]
            ),
          false
        );
        j(path).replaceWith(dialog);
      });
  
    // 4. Replace <Input .../> with <TextField variant="outlined" .../>
    root
      .find(j.JSXElement, { openingElement: { name: { name: "Input" } } })
      .forEach(path => {
        path.node.openingElement.name.name = "TextField";
        path.node.openingElement.attributes.push(
          j.jsxAttribute(j.jsxIdentifier("variant"), j.literal("outlined"))
        );
        if (path.node.closingElement) path.node.closingElement.name.name = "TextField";
      });
  
    // 5. Ensure Dialog, TextField, and any used components are imported
    const needed = new Set(["Dialog","DialogTitle","DialogContent","DialogActions","TextField"]);
    // scan JSX for names
    root.find(j.JSXIdentifier).forEach(id => {
      if (/^[A-Z]/.test(id.node.name)) needed.add(id.node.name);
    });
    const existing = new Set();
    materialImport
      .find(j.ImportSpecifier)
      .forEach(spec => existing.add(spec.node.imported.name));
  
    // add missing specifiers
    const toAdd = Array.from(needed).filter(n => !existing.has(n));
    if (toAdd.length && materialImport.size()) {
      materialImport.forEach(path => {
        path.node.specifiers.push(
          ...toAdd.map(n => j.importSpecifier(j.identifier(n)))
        );
      });
    }
  
    return root.toSource({ quote: "double" });
  }