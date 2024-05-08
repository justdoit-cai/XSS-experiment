#!/bin/bash
echo "=== setup.sh is start ==="
mongosh --eval <<EOF
use demo;
db.createCollection("comments");
db.comments.insertOne({ _id: '$(openssl rand -hex 16)', content: 'the first comment'});
db.comments.insertOne({ _id: '$(openssl rand -hex 16)', content: 'the second comment'});
EOF