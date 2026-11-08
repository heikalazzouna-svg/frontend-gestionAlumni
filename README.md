# DemoWeb

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 19.0.4.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

---

## AI Interview Simulator Backend

This workspace includes a lightweight Node.js backend that proxies requests to
an LLM (e.g. OpenAI GPT-4). It is used by the AI simulator page to generate
questions and evaluate answers.

### Configuration

1. Install the backend dependencies in the `backend` folder:
   ```bash
   cd backend
   npm install express node-fetch
   ```
2. Set your OpenAI API key in the environment:
   ```bash
   export OPENAI_API_KEY=YOUR_KEY_HERE
   # on Windows PowerShell: setx OPENAI_API_KEY "YOUR_KEY_HERE"
   ```
3. Launch the backend:
   ```bash
   npm run backend
   ```
   The server listens by default on port 3001.

Alternative (dev): use a local `.env` file inside `backend` (do not commit it).
1. Copy `backend/.env.example` to `backend/.env` and paste your key there:
   ```bash
   cp backend/.env.example backend/.env
   # edit backend/.env and set OPENAI_API_KEY
   ```
   On Windows PowerShell use `Copy-Item backend\.env.example backend\.env` then edit the file.
2. Start the backend as before: `npm run backend`.

### Running the frontend with proxy

The Angular dev server is configured (`proxy.conf.json`) to forward `/api`
requests to the backend. Start the frontend with:

```bash
npm start
```

Then navigate to `http://localhost:4200/` and click **Simulateur IA**. The
application will use the backend to fetch AI-generated questions when
`AiApiService.useRemote` is set to `true` in the source code.

### Production

Build the Angular app (`npm run build`) and deploy the backend separately. Make
sure the backend URL is configured via `AiApiService.baseUrl`.


```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

---

### Module événements

Le projet inclut désormais un module `events` qui fournit :

* `EventService` (stockage en local ou mémoire)
* Interface `Event` et type `EventType`
* Composants standalone :
  * `EventsListComponent` (liste/grille, filtres, recherche)
  * `EventDetailComponent` (page de détails et inscription)
  * `EventCreateComponent` (formulaire de création d'événement)

Les routes suivantes sont exposées : `/events`, `/events/create`, `/events/:id`.

