const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, 'src', 'app', 'routes.tsx');
let content = fs.readFileSync(targetFile, 'utf8');

// 1. We will find every block that looks like:
// const ___Route = createRoute({
//   ...
//   component: () => (
//     <LazyPage>
//       <HomePage />
//     </LazyPage>
//   ),
// });
// Or LazyInner, or ProtectedRoute.

// 2. We will replace `component: () => ( `<Wrapper> <Component /> </Wrapper> ` )`
//    with `component: withXYZWrapper(Component)`
// Wait, we can define HOCs at the top of the file!

// Add the HOC helpers around where LazyPage and LazyInner were defined (line 210)
const HOCs = `
function withLazyPage(Component: React.ComponentType<any>) {
  function WithLazyPage(props: any) {
    return (
      <Suspense fallback={<SplashScreen />}>
        <Component {...props} />
      </Suspense>
    );
  }
  WithLazyPage.displayName = \`withLazyPage(\${Component.displayName || Component.name || "Component"})\`;
  return WithLazyPage;
}

function withLazyInner(Component: React.ComponentType<any>) {
  function WithLazyInner(props: any) {
    return (
      <Suspense fallback={<div />}>
        <Component {...props} />
      </Suspense>
    );
  }
  WithLazyInner.displayName = \`withLazyInner(\${Component.displayName || Component.name || "Component"})\`;
  return WithLazyInner;
}

// Extract ProtectedRoute wrapper to HOC
function withProtected(Component: React.ComponentType<any>) {
  function WithProtected(props: any) {
    return (
      <ProtectedRoute>
        <Suspense fallback={<SplashScreen />}>
          <Component {...props} />
        </Suspense>
      </ProtectedRoute>
    );
  }
  WithProtected.displayName = \`withProtected(\${Component.displayName || Component.name || "Component"})\`;
  return WithProtected;
}

function withProtectedInner(Component: React.ComponentType<any>) {
  function WithProtectedInner(props: any) {
    return (
      <ProtectedRoute>
        <Suspense fallback={<div />}>
          <Component {...props} />
        </Suspense>
      </ProtectedRoute>
    );
  }
  WithProtectedInner.displayName = \`withProtectedInner(\${Component.displayName || Component.name || "Component"})\`;
  return WithProtectedInner;
}
`;

// Replace LazyPage & LazyInner definitions with HOCs
content = content.replace(
/function LazyPage\(\{[^}]+\}\) \{([\s\S]*?)function LazyInner\(\{[^}]+\}\) \{[\s\S]*?<\/Suspense>;\n\}/,
HOCs.trim()
);

// We need to replace `component: () => (...)`
// Let's use precise Regex replacers

// For ProtectedRoute + LazyPage
content = content.replace(
  /component:\s*\(\)\s*=>\s*\(\s*<ProtectedRoute>\s*<LazyPage>\s*<([A-Za-z0-9_]+) \/>\s*<\/LazyPage>\s*<\/ProtectedRoute>\s*\),/g,
  'component: withProtected($1),'
);

// For ProtectedRoute + LazyInner
content = content.replace(
  /component:\s*\(\)\s*=>\s*\(\s*<ProtectedRoute>\s*<LazyInner>\s*<([A-Za-z0-9_]+) \/>\s*<\/LazyInner>\s*<\/ProtectedRoute>\s*\),/g,
  'component: withProtectedInner($1),'
);

// For LazyPage only
content = content.replace(
  /component:\s*\(\)\s*=>\s*\(\s*<LazyPage>\s*<([A-Za-z0-9_]+) \/>\s*<\/LazyPage>\s*\),/g,
  'component: withLazyPage($1),'
);

// For LazyInner only
content = content.replace(
  /component:\s*\(\)\s*=>\s*\(\s*<LazyInner>\s*<([A-Za-z0-9_]+) \/>\s*<\/LazyInner>\s*\),/g,
  'component: withLazyInner($1),'
);

// Try replacing single child for LazyPage (including with attributes like admin/courses)
content = content.replace(
  /component:\s*\(\)\s*=>\s*\(\s*<LazyPage>\s*<([A-Za-z0-9_]+)[^>]*\/>\s*<\/LazyPage>\s*\),/g,
  'component: withLazyPage($1),'
);

// For cases without props
content = content.replace(
  /component:\s*\(\)\s*=>\s*<([A-Za-z0-9_]+) \/>,/g,
  'component: $1,'
);

// Add ESLint disable comment to the top of the file to fix 'react-refresh/only-export-components' since HOCs are technically unexported components
if (!content.includes('/* eslint-disable react-refresh/only-export-components */')) {
  content = '/* eslint-disable react-refresh/only-export-components */\n' + content;
}

fs.writeFileSync(targetFile, content);
console.log('Update finished. Please check diff.');
