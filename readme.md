# 📊 Serverless Website View Counter

> A real-time, globally distributed website view counter built entirely with AWS serverless technologies.

![AWS Serverless](https://img.shields.io/badge/AWS-Serverless-orange?logo=amazonaws)
![Lambda](https://img.shields.io/badge/AWS-Lambda-FF9900?logo=awslambda&logoColor=white)
![DynamoDB](https://img.shields.io/badge/AWS-DynamoDB-4053D6?logo=amazondynamodb&logoColor=white)
![CloudFront](https://img.shields.io/badge/AWS-CloudFront-232F3E?logo=amazonaws&logoColor=white)
![Python](https://img.shields.io/badge/Python-3.11-3776AB?logo=python&logoColor=white)

---

## 📌 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Project Structure](#project-structure)
- [Setup & Deployment](#setup--deployment)
- [Security Considerations](#security-considerations)
- [Optional Upgrades](#optional-upgrades)
- [Outcome](#outcome)
- [References](#references)

---

## Overview

This project implements a **serverless website view counter** that tracks total visitors in real time. Instead of relying on traditional servers, it leverages **AWS Lambda**, **Amazon DynamoDB**, and **Amazon CloudFront** to deliver a scalable, cost-effective, and maintenance-free solution.

Every time a user visits the site, the frontend sends a request to a Lambda Function URL, which atomically increments the view count in DynamoDB and returns the updated value to display on the page.

---

## 🏗 Architecture

```
User Browser
     │
     │  HTTPS Request
     ▼
Amazon CloudFront (CDN)
     │
     │  Serves static files (HTML/CSS/JS)
     ▼
Frontend (S3 / Static Hosting)
     │
     │  fetch() → Lambda Function URL
     ▼
AWS Lambda (Python 3.11)
     │
     │  UpdateItem (atomic increment)
     ▼
Amazon DynamoDB
     │
     │  Returns updated view count
     ▼
Lambda → Frontend → Displayed to User
```

| Component     | Technology              | Purpose                                   |
|---------------|-------------------------|-------------------------------------------|
| Frontend      | HTML / CSS / JavaScript | User interface displaying the view count  |
| CDN           | Amazon CloudFront       | Distributes static site globally          |
| Backend       | AWS Lambda (Python 3.11)| Handles visitor counting logic            |
| Database      | Amazon DynamoDB         | Stores the persistent global view count   |
| API Endpoint  | Lambda Function URL     | Serverless, publicly accessible endpoint  |

**How it works:**

1. User visits the website served via **CloudFront**.
2. The frontend JavaScript calls the **Lambda Function URL**.
3. Lambda reads the current count from **DynamoDB** and increments it.
4. The updated count is returned to the frontend as a JSON response.
5. The frontend updates the view counter displayed on the page.

This design ensures **race-condition-free updates** and an infinitely **scalable, serverless architecture** with no idle server costs.

---

## 🚀 Features

- **Real-time global view count** — Tracks all visitors across devices and browsers.
- **Atomic updates** — Uses DynamoDB `put_item` after reading the latest value to prevent race conditions.
- **CORS-enabled Lambda** — Frontend can safely fetch data from any origin.
- **Graceful error handling** — Displays a user-friendly fallback message if the backend is unreachable.
- **Modern, responsive UI** — Glassmorphism style with gradient backgrounds, hover effects, and mobile support.
- **Zero server maintenance** — Entirely serverless; AWS manages all infrastructure scaling.

---

## 💻 Technologies Used

| Layer      | Technology                    |
|------------|-------------------------------|
| Frontend   | HTML5, CSS3, JavaScript (ES6) |
| Backend    | Python 3.14 on AWS Lambda     |
| Database   | Amazon DynamoDB (NoSQL)       |
| CDN        | Amazon CloudFront             |
| Hosting    | Amazon S3 (static files)      |
| Version Control | Git + GitHub             |

---

## 📂 Project Structure

```
serverless-view-counter/
│
├── index.html        # Main frontend page
├── styles.css        # UI styling (glassmorphism, gradients, responsive)
├── script.js         # JavaScript logic — fetches Lambda endpoint
├── lambda_function.py# AWS Lambda handler (Python)
├── README.md         # Project documentation
└── .gitignore        # Excludes secrets, .env, .pem files
```

---

## 🔧 Setup & Deployment

### Prerequisites

- An active [AWS account](https://aws.amazon.com/)
- AWS CLI configured (`aws configure`)
- Git installed locally
- Basic familiarity with Lambda, DynamoDB, and S3

---

### Step 1 — Clone the Repository

```bash
git clone https://github.com/RiddhiDhara/Project-1---Create-a-serverless-web-application-on-AWS
cd serverless-view-counter
```

---

### Step 2 — Create the DynamoDB Table

In the AWS Console (or via CLI), create a DynamoDB table:

| Setting         | Value                                                          |
|-----------------|----------------------------------------------------------------|
| Table Name      | `serverless-web-application-on-aws-98562147853`               |
| Partition Key   | `id` (String)                                                  |
| Billing Mode    | On-demand (Pay-per-request)                                    |

Insert the initial item:

```json
{
  "id": "0",
  "views": 0
}
```

---

### Step 3 — Create the IAM Role for Lambda

Create an IAM role with the following inline policy to allow Lambda to read and write to your DynamoDB table:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:UpdateItem",
        "dynamodb:GetItem",
        "dynamodb:PutItem"
      ],
      "Resource": "arn:aws:dynamodb:REGION:ACCOUNT_ID:table/serverless-web-application-on-aws-98562147853"
    }
  ]
}
```

> Replace `REGION` and `ACCOUNT_ID` with your actual AWS region and account ID.

---

### Step 4 — Deploy the Lambda Function

Create a new Lambda function in the AWS Console:

- **Runtime:** Python 3.11
- **Execution Role:** Attach the IAM role created above
- **Function URL:** Enable it with `CORS` set to `*` (or your specific domain)

Paste the following code as the Lambda handler:

```python
import json
import boto3

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('serverless-web-application-on-aws-98562147853')

def lambda_handler(event, context):
    # Read current view count
    response = table.get_item(Key={'id': '0'})
    views = response['Item']['views']

    # Increment and save
    views += 1
    table.put_item(Item={'id': '0', 'views': views})

    print(f"View count updated to: {views}")

    return {
        'statusCode': 200,
        'headers': {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
        },
        'body': json.dumps({'views': views})
    }
```

After deploying, **copy the Function URL** from the Lambda console.

---

### Step 5 — Configure the Frontend

In `script.js`, replace `YOUR_LAMBDA_URL` with your copied Function URL:

```javascript
const counter = document.getElementById("count");

async function updateCounter() {
    try {
        let response = await fetch("YOUR_LAMBDA_URL");
        let data = await response.json();
        counter.textContent = data.views;
    } catch (error) {
        console.error("Failed to fetch view count:", error);
        counter.textContent = "Unavailable";
    }
}

updateCounter();
```

---

### Step 6 — Host the Frontend via S3 + CloudFront

1. Create an **S3 bucket** and enable **static website hosting**.
2. Upload `index.html`, `styles.css`, and `script.js` to the bucket.
3. Create a **CloudFront distribution** pointing to the S3 bucket.
4. Use the CloudFront URL to access your live view counter.

---

## 🔐 Security Considerations

- **Never push AWS credentials** — Keep `.env`, `.pem`, and `credentials` files in `.gitignore`.
- **Least privilege IAM** — The Lambda role should only have `GetItem`, `PutItem`, and `UpdateItem` permissions on the specific table.
- **CORS policy** — Restrict `Access-Control-Allow-Origin` to your domain in production (avoid `*`).
- **CloudWatch logging** — Enable Lambda logging to monitor invocations and errors.
- **Rate limiting** — Consider adding AWS WAF or Lambda throttling to prevent abuse via spam refreshes.

---

## ⚡ Optional Upgrades

| Upgrade                          | Description                                               |
|----------------------------------|-----------------------------------------------------------|
| Unique visitor tracking          | Use session tokens or hashed IPs to count unique visitors |
| Timestamp logging                | Store visit timestamps in DynamoDB for time-series data   |
| Analytics dashboard              | Visualize traffic trends using CloudWatch or a custom UI  |
| Rate limiting                    | Prevent counter inflation from rapid/bot refreshes        |
| Custom domain + SSL              | Use Route 53 + ACM for a professional domain with HTTPS   |
| Atomic DynamoDB increment        | Replace `get + put` with `UpdateExpression` for true atomicity |

---

## 🎯 Outcome

By completing and deploying this project, you demonstrate:

- Designing a **serverless architecture** on AWS
- Working with **DynamoDB** for NoSQL data persistence
- Building and exposing a **Lambda Function URL** as a REST-like API
- Integrating **CloudFront + S3** for global static site delivery
- Writing **frontend-backend communication** using `fetch()`
- Applying **IAM security best practices** with least-privilege roles

This is a **portfolio-grade, real-world cloud project** suitable for showcasing in interviews and as a demonstration of practical AWS skills.

---

## 📖 References

- [AWS Lambda Documentation](https://docs.aws.amazon.com/lambda/latest/dg/welcome.html)
- [Amazon DynamoDB Documentation](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Introduction.html)
- [AWS CloudFront Documentation](https://docs.aws.amazon.com/cloudfront/)
- [Amazon S3 Static Website Hosting](https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteHosting.html)
- [AWS IAM Best Practices](https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html)

---

> 💡 **Built with AWS Serverless Technologies** — No servers. No idle costs. Infinite scale.