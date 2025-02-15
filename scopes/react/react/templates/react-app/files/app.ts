import { ComponentContext } from '@teambit/generator';

export function appFile({ namePascalCase: Name }: ComponentContext) {
  return `import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

export function ${Name}App() {
  return (
    <BrowserRouter>

       {/* header component */}

        <Routes>
          <Route path="/" element={<div>Hello World!!</div>}>
             {/* home page component */}
          </Route>

          <Route path="/about">
             {/* about page component */}
          </Route>

        </Switch>

        {/* footer component */}

    </BrowserRouter>
  );
}
`;
}
