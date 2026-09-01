const fs = require('fs');
let code = fs.readFileSync('src/components/VisitForm.tsx', 'utf8');

code = code.replace(
`    }
} } if ((name`, 
`    }
}
return newData;
})
if ((name`
);

fs.writeFileSync('src/components/VisitForm.tsx', code);
