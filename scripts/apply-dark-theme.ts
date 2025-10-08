import fs from "fs";
import path from "path";

const filesToUpdate = [
  "src/app/admin/page.tsx",
  "src/app/digimons/page.tsx",
  "src/app/components/AddDigimonModal.tsx",
  "src/app/components/EvolutionModal.tsx",
  "src/app/components/EvolutionLineModal.tsx",
];

const replacements: [RegExp, string][] = [
  // Backgrounds
  [/bg-white\b/g, "bg-gray-800"],
  [/bg-gray-50\b/g, "bg-gray-800"],
  [/bg-gray-100\b/g, "bg-gray-900"],

  // Text colors
  [/text-gray-600\b/g, "text-gray-300"],
  [/text-gray-700\b/g, "text-gray-200"],
  [/text-gray-800\b/g, "text-white"],
  [/text-gray-900\b/g, "text-white"],
  [/text-black\b/g, "text-white"],

  // Borders
  [/border-gray-200\b/g, "border-gray-700"],
  [/border-gray-300\b/g, "border-gray-600"],

  // Inputs and forms
  [/focus:border-transparent/g, "focus:border-blue-500"],

  // Hover states for gray elements
  [/hover:bg-gray-100\b/g, "hover:bg-gray-700"],
  [/hover:bg-gray-200\b/g, "hover:bg-gray-600"],
  [/hover:border-gray-400\b/g, "hover:border-gray-500"],
  [/hover:text-gray-700\b/g, "hover:text-gray-200"],
  [/hover:text-gray-900\b/g, "hover:text-white"],
];

let totalChanges = 0;

filesToUpdate.forEach((filePath) => {
  const fullPath = path.join(process.cwd(), filePath);

  if (!fs.existsSync(fullPath)) {
    return;
  }

  let content = fs.readFileSync(fullPath, "utf-8");
  let fileChanges = 0;

  replacements.forEach(([pattern, replacement]) => {
    const matches = content.match(pattern);
    if (matches) {
      fileChanges += matches.length;
      content = content.replace(pattern, replacement);
    }
  });

  if (fileChanges > 0) {
    fs.writeFileSync(fullPath, content, "utf-8");

    totalChanges += fileChanges;
  } else {
  }
});

console.log(
  `   Total de ${totalChanges} alterações em ${filesToUpdate.length} arquivos`
);
