# --- Provider & Randomizer for Unique Bucket Name ---

terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.5"
    }
  }
}

provider "aws" {
  region = "us-east-1"
}

resource "random_pet" "bucket_suffix" {
  length = 2
}


# --- S3 Bucket ---
resource "aws_s3_bucket" "replica_bucket" {
  bucket = "replica-${random_pet.bucket_suffix.id}"

  tags = {
    Name        = "Replica Bucket"
    ManagedBy   = "Terraform"
  }
}

resource "aws_s3_bucket_public_access_block" "replica_bucket_pab" {
  bucket = aws_s3_bucket.replica_bucket.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}


# --- IAM User and Permissions ---
resource "aws_iam_user" "s3_user" {
  name = "s3-replica-bucket-user"
  path = "/system/"

  tags = {
    Description = "IAM user with access to the replica S3 bucket"
  }
}

data "aws_iam_policy_document" "s3_user_policy_doc" {
  statement {
    effect = "Allow"
    actions = [
      "s3:ListBucket",
      "s3:GetBucketLocation"
    ]
    resources = [
      aws_s3_bucket.replica_bucket.arn
    ]
  }

  statement {
    effect = "Allow"
    actions = [
      "s3:PutObject",    
      "s3:GetObject",    
      "s3:DeleteObject"  
    ]
    resources = [
      "${aws_s3_bucket.replica_bucket.arn}/*"
    ]
  }
}

resource "aws_iam_user_policy" "s3_user_policy" {
  name   = "S3ReplicaBucketUserPolicy"
  user   = aws_iam_user.s3_user.name
  policy = data.aws_iam_policy_document.s3_user_policy_doc.json
}


# --- IAM User Credentials ---
resource "aws_iam_access_key" "s3_user_key" {
  user = aws_iam_user.s3_user.name
}


# --- Outputs ---
output "s3_bucket_name" {
  description = "The name of the created S3 bucket."
  value       = aws_s3_bucket.replica_bucket.id
}

output "s3_user_access_key_id" {
  description = "The access key ID for the IAM user."
  value       = aws_iam_access_key.s3_user_key.id
}

output "s3_user_secret_access_key" {
  description = "The secret access key for the IAM user. Store this securely!"
  value       = aws_iam_access_key.s3_user_key.secret
  sensitive   = true
}