const fs = require('fs');
let code = fs.readFileSync('src/components/VisitForm.tsx', 'utf8');

const targetStr = `        newData.consumoAcumuladoReal = undefined;
    }
} } if ((name === 'date'`;

const replacement = `        newData.consumoAcumuladoReal = undefined;
    }
}
return newData;
});
  if ((name === 'date'`;

if (code.includes(targetStr)) {
    code = code.replace(targetStr, replacement);
    fs.writeFileSync('src/components/VisitForm.tsx', code);
    console.log("Fixed!");
} else {
    console.log("Not found");
    const partial = `} } if ((name ===`;
    if (code.includes(partial)) {
        console.log("Found partial!");
        code = code.replace(partial, `}
return newData;
});
if ((name ===`);
        fs.writeFileSync('src/components/VisitForm.tsx', code);
    }
}
