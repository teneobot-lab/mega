const fs = require('fs');
const files = [
  "src/pages/master/SalesmanForm.tsx",
  "src/pages/master/WarehouseForm.tsx",
  "src/pages/master/DepartmentForm.tsx",
  "src/pages/master/CurrencyForm.tsx",
  "src/pages/master/TaxForm.tsx",
  "src/pages/master/AccountForm.tsx"
];

for(let file of files) {
  let content = fs.readFileSync(file, 'utf8');

  // Add imports
  if (!content.includes('ConfirmDeleteDialog')) {
      content = content.replace(
          /import \{ masterApi.*?;/,
          `$& \nimport { ConfirmDeleteDialog } from "../../components/ui/confirm-delete-dialog";`
      );
  }

  // Add states
  const stateRegex = /const \[isSaving, setIsSaving\] = useState\(false\);/;
  if (content.match(stateRegex)) {
      content = content.replace(
          stateRegex,
          `const [isSaving, setIsSaving] = useState(false);\n  const [isDeleting, setIsDeleting] = useState(false);\n  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);`
      );
  }

  // Update handleDelete
  const handleDeleteRegex = /const handleDelete = async \(\) => \{\n\s+if \(\!window\.confirm\("Yakin ingin menghapus.*?ini\?"\)\) return;\n\s+try \{\n\s+await masterApi\.delete(.*?)(\(id!\));\n\s+toast\.success\(".*?berhasil dihapus"\);\n\s+navigate\("(.*?)"\);\n\s+\} catch \(e: any\) \{\n\s+toast\.error\(e\.message \|\| "Gagal menghapus"\);\n\s+\}\n\s+\};/;
  
  const match = content.match(handleDeleteRegex);
  if (match) {
      const functionName = "delete" + match[1];
      const navPath = match[3];
      const newHandleDelete = `const handleDelete = async () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      await masterApi.${functionName}(id!);
      toast.success("Berhasil dihapus");
      navigate("${navPath}");
    } catch (e: any) {
      toast.error(e.message || "Gagal menghapus");
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };`;
      content = content.replace(handleDeleteRegex, newHandleDelete);
  }

  // Add component
  const formEndRegex = /<\/FullscreenFormLayout>/;
  if (content.match(formEndRegex)) {
      content = content.replace(
          /return \(\n\s+(<FullscreenFormLayout[\s\S]*?)<\/FullscreenFormLayout>\n\s+\);/,
          `return (\n    <>\n      $1</FullscreenFormLayout>\n      <ConfirmDeleteDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm} onConfirm={confirmDelete} title="Konfirmasi" description="Apakah Anda yakin ingin menghapus data ini?" isLoading={isDeleting} />\n    </>\n  );`
      );
  }

  fs.writeFileSync(file, content);
}
