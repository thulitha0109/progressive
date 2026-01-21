# How to Clone Production to Development (Full Guide)

## Overview
This guide explains how to migrate data from the **Production Server** to the **Development/Staging Environment** running in Portainer.

**Prerequisites:**
1.  **Production Stack** is running.
2.  **Staging Stack** is deployed and running in Portainer.
3.  **Portainer Console Access** to Staging containers.

---

## Step 1: Clone the Database (Users, Tracks)

**Goal**: Pipe the database dump directly from Prod to Staging without saving a file.

1.  **Open Console**: In Portainer, go to the **Staging** stack -> **`postgres`** container -> **Console (>_)**.
2.  **Run Command**:
    *(Replace `PROD_IP` and `YOUR_PROD_PASSWORD` with actual values)*
    ```bash
    # 1. Export Production Password (so pg_dump doesn't ask)
    export PGPASSWORD='YOUR_PROD_PASSWORD'

    # 2. Pipe Dump: PROD (Remote) -> STAGING (Localhost)
    # The second PGPASSWORD is for the Staging DB (likely 'password' or what you set in Env)
    pg_dump -h PROD_IP -U postgres progressive | PGPASSWORD='YOUR_STAGING_PASSWORD' psql -h localhost -U postgres -d progressive
    ```
    *If it runs silently or shows only warnings, it worked.*

---

## Step 2: Clone the Files (Images, Audio)

**Goal**: Mirror S3 bucket contents from Prod to Staging using MinIO Client (`mc`).

1.  **Open Console**: In Portainer, go to the **Staging** stack -> **`minio`** container -> **Console (>_)**.
2.  **Verify Creds**: Run `env | grep MINIO` to see your current Staging Username/Password.
3.  **Run Commands**:

    ```bash
    # A. Connect to Staging (Self)
    # Use the User/Pass you found in Step 2.
    mc alias set staging http://localhost:9000 MINIO_ROOT_USER MINIO_ROOT_PASSWORD

    # B. Connect to Production (Remote)
    # Use your REAL Prod MinIO credentials.
    mc alias set prod http://PROD_IP:9000 minioadmin minioadminpassword

    # C. Create Bucket (Just in case)
    mc mb staging/progressive-uploads

    # D. Mirror Data (Prod -> Staging)
    mc mirror --overwrite prod/progressive-uploads staging/progressive-uploads

    # E. Fix Permissions (Make Public)
    # Critical: Images won't load without this!
    mc anonymous set download staging/progressive-uploads
    ```

---

## ⚠️ Troubleshooting

**"Authentication Failed" (Postgres)**
*   **Cause**: Old volume has a different password than your current Config.
*   **Fix**:
    1.  Stop Staging Stack.
    2.  Go to Portainer > **Volumes**.
    3.  Delete `progressive-dev_postgres_data`.
    4.  Restart Stack. (It creates a fresh DB with new password).

**"Signature Does Not Match" (MinIO)**
*   **Cause**: You used the wrong Password/Key in `mc alias set`.
*   **Fix**: Run `env` in the console to see the *actual* keys the container is using.

**"Bucket does not exist"**
*   **Fix**: Run `mc mb staging/progressive-uploads`.

**"400 Bad Request" (Images)**
*   **Cause**: Next.js cannot fetch image because bucket is Private (403).
*   **Fix**: Run `mc anonymous set download staging/progressive-uploads`.
