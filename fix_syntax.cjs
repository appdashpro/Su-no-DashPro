const fs = require('fs');
let code = fs.readFileSync('src/components/VisitForm.tsx', 'utf8');

code = code.replace(
`        newData.consumoAcumuladoReal = undefined;
    }
} }`, 
`        newData.consumoAcumuladoReal = undefined;
    }
}
return newData;
}`
);

fs.writeFileSync('src/components/VisitForm.tsx', code);
