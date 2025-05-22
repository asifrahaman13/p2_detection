## About the application.

Repository to deal with the documents masking out the sensitive information. Currently, this is in the form of mono repo. Make sure you have node , uv (package manager for python) installed in your system.\


![Screenshot from 2025-05-21 08-29-19](https://github.com/user-attachments/assets/082b7da6-e97a-45f1-a333-69b746a0889d)

![Screenshot from 2025-05-18 11-39-54](https://github.com/user-attachments/assets/df21a377-4707-4eff-9e3a-afdeb1c0df0f)

![Screenshot from 2025-05-21 08-32-50](https://github.com/user-attachments/assets/933905b4-5293-4ee6-9887-47f1ab50698a)

![Screenshot from 2025-05-18 11-41-45](https://github.com/user-attachments/assets/47d4acc6-03e6-4ffa-9b44-3912758d9b6f)

![Screenshot from 2025-05-20 09-09-58](https://github.com/user-attachments/assets/20b53c7b-e44d-4c70-ba93-97ad58e944d2)

![Screenshot from 2025-05-20 09-09-26](https://github.com/user-attachments/assets/c9785721-3021-4517-9dd5-574cecd7edf5)


## Backend

```bash
git clone hhttps://github.com/asifrahaman13/p2_detection.git
```

Next go to the root directory.

```bash
cd p2_detection
```

Now set up a virtual environment

```bash
uv venv
source .venv/bin/activate
```

Next install the dependencies.

```bash
uv sync
```

Create a .env file from the .env.example file, and ensure you enter the correct credentials.

```bash
mv .env.example .env
```

Next enter your credentials in .env file. Now you should be able to run the application in dev environment.

```bash
uv run uvicorn src.main:app --reload
```

For the production environment, you can use the unicorn and unicorn combined instead. (Here, we used 4 workers.)

```bash
gunicorn src.main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

## Front end

Go to the front-end directory

```bash
cd web/
```

Create a .env file from the .env.example file and ensure you enter the correct credentials.

```bash
mv .env.example .env
```

Now install the dependencies.

```bash
bun install
```

Next, run the server in the local environment.

```bash
bun run dev
```

## Run as a docker container

The application can also be run as a docker container service. Run the following command in the root folder. Make sure you enter the correcnt credentials in the .env file of both the frontend and backend.


```bash
docker compose up
```


## Formatting


For linting the backend run the following:

```bash
ruff check --fix
```

For formatting run the following script:

```bash
ruff format
```

If you want to run the pre-commit hooks, you can run the following command. They will run anyway.

```bash
uv run pre-commit run
```

For linting the frontend run the following inside the web folder.

```bash
bun run lint
```

For the format run the following:

```bash
bun run format
```


# Tests

Few test scripts are present to test the functionalities.

```bash
pytest
```

## Ports

The frontend of the application will run on port 3000. `http://127.0.0.1:3000`. But you need to hit the following api instead to be in the dashboard: `http://localhost:3000/dashboard/cases`

The backend of the application will run on port 8000 `http://127.0.0.1:8000`
