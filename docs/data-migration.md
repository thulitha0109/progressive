# How to Clone Production to Development (Full Guide)

## ⚠️ Troubleshooting: "Authentication Failed"

If you see: `Authentication failed against database server at 'postgres'`

**The Cause:**
You have an **Old Database Volume** on your Dev server that was created with a different password (possibly by the old "Limited Control" stack).
Docker **does not** update the database password just because you changed the `docker-compose.yml`. The password is set *only* when the volume is first created.

**The Fix: Reset the Dev Database**
Since you are migrating data from Prod anyway, you should **Delete the Broken Dev Database** so it can be re-created fresh.

1.  **Stop the Dev Stack**:
    *   Portainer: Stop the `progressive-dev` stack.
2.  **Delete the Volume**:
    *   Go to **Portainer** > **Volumes**.
    *   Find the volume named `progressive_postgres_data` (or similar).
    *   Select it and clicking **Remove**.
    *   *Note: Ensure you are removing the **DEV** volume, not Prod!*
3.  **Restart the Stack**:
    *   Start `progressive-dev`.
    *   Docker will see the missing volume and create a **New, Empty Database** using the correct password from your YAML.
4.  **Retry Migration**:
    *   Now run the `pg_dump | psql` command again. It should work because the passwords now match.

---

## Step 1: Clone the Stack (The Code)

**Goal**: Get the App running on Dev.

1.  **Get the Prod YAML**: 
    *   Since Portainer "Limited Control" might not show the full editor, you might need to view the file on the Prod Server (e.g. `cat docker-compose.yml`) OR copy your local `docker-compose.yml` (since Prod uses the same code).
2.  **Create Stack on Dev**:
    *   Open **Dev Portainer**.
    *   Go to **Stacks** > **Add stack**.
    *   **Name**: `progressive-release` (or `progressive-dev`).
    *   **Build Method**: Web editor.
    *   **Content**: Paste your YAML.
        *   *Tip*: Ensure `image: progressive-app` is correct. If you don't use a registry, you might need to build the image locally first (`docker build -t progressive-app .`).
    *   **Deploy**.
    *   *Result*: App is running. Database is empty.

### Step 2: Clone the Data (The Content)

**Goal**: Overwrite the empty Dev DB with Prod Data.

#### Part A: Database (Users, Tracks)
1.  **In Dev Portainer**: Click the **Console (>_)** icon on your **Postgres** container.
2.  **Connect** (User: `postgres` or `root`).
3.  **Run**:
    ```bash
    # 1. Export PGPASSWORD so it doesn't ask (Prod Password)
    export PGPASSWORD='marketing_team_knows_this'

    # 2. Pipe Dump: PROD -> DEV
    # Syntax: pg_dump -h <PROD_IP> | psql -U postgres
    pg_dump -h 192.168.1.50 -U postgres progressive | psql -U postgres -d progressive
    ```

#### Part B: Files (Images, Audio)
1.  **In Dev Portainer**: Open Console on a container that has `mc` (or deploy a temp `minio/mc` container).
2.  **Run**:
    ```bash
    # 1. Connect to Prod
    mc alias set prod http://192.168.1.50:9000 minioadmin minioadminpassword

    # 2. Connect to Dev (Internal)
    mc alias set dev http://minio:9000 minioadmin minioadminpassword

    # 3. Clone Files
    mc mirror --overwrite prod/progressive-uploads dev/progressive-uploads
    ```

---

## Summary
| Feature | Works for "Limited Control" Stacks? | Copies Data? |
| :--- | :--- | :--- |
| **Portainer "Duplicate" Button** | ❌ **No** | ❌ **No** |
| **Manual YAML + Console Copy** | ✅ **Yes** | ✅ **Yes** |

**Use the Manual Clone method (Step 1 + Step 2 above).**
