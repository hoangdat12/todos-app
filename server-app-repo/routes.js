const express = require('express');
const router = express.Router();
const { randomUUID } = require('crypto');
const {
  DynamoDBClient,
  PutItemCommand,
  DeleteItemCommand,
  UpdateItemCommand,
  ScanCommand,
  GetItemCommand,
} = require('@aws-sdk/client-dynamodb');

const client = new DynamoDBClient({
  region: process.env.REGION,
});

const TODO_TABLE = process.env.TODO_TABLE_NAME;

const getTodo = async (_id) => {
  const getParams = {
    TableName: TODO_TABLE,
    Key: {
      _id: {
        S: _id,
      },
    },
  };

  const getCommand = new GetItemCommand(getParams);

  const foundData = await client.send(getCommand);

  return foundData['Item'] ? foundData['Item'] : null;
};

const formatData = (dynamoDBData) => {
  const response = {};
  for (let key of Object.keys(dynamoDBData)) {
    if (key === 'status') {
      response[key] = dynamoDBData[key]['BOOL'];
    } else response[key] = dynamoDBData[key]['S'];
  }

  return response;
};

// GET /todos
router.get('/todos', async (req, res) => {
  const getParams = {
    TableName: TODO_TABLE,
  };

  const scanCommand = new ScanCommand(getParams);

  const todos = await client.send(scanCommand);

  const response = [];
  const items = todos['Items'];
  for (let item of items) {
    response.push(formatData(item));
  }

  res.status(200).json(response);
});

// POST /todos
router.post('/todos', async (req, res) => {
  let { todo } = req.body;

  if (!todo) {
    return res.status(400).json({ mssg: 'error no todo found' });
  }

  const timestamp = new Date().toISOString();
  const _id = randomUUID();
  const putParams = {
    TableName: TODO_TABLE,
    Item: {
      _id: {
        S: _id,
      },
      todo: {
        S: todo,
      },
      status: { BOOL: false },
      createdAt: {
        S: timestamp,
      },
      updatedAt: {
        S: timestamp,
      },
    },
  };

  const putCommand = new PutItemCommand(putParams);

  const newTodo = await client.send(putCommand);

  const httpStatusCode = newTodo['$metadata'].httpStatusCode;

  if (httpStatusCode !== 200 && httpStatusCode !== 201) {
    return res.status(500).json({ mssg: 'internal server error!' });
  }

  const foundTodo = await getTodo(_id);

  res.status(201).json(foundTodo);
});

// DELETE /todos/:id
router.delete('/todos/:id', async (req, res) => {
  const _id = req.params.id;

  const deleteParams = {
    TableName: TODO_TABLE,
    Key: {
      _id: {
        S: _id,
      },
    },
  };

  const command = new DeleteItemCommand(deleteParams);

  const deleteTodo = await client.send(command);
  const httpStatusCode = deleteTodo['$metadata'].httpStatusCode;

  if (httpStatusCode !== 200 && httpStatusCode !== 201) {
    return res.status(500).json({ mssg: 'internal server error!' });
  }

  res.status(200).json({
    msg: 'Delete todo success!',
    acknowledged: true,
  });
});

// PUT /todos/:id
router.put('/todos/:id', async (req, res) => {
  const _id = req.params.id;
  const { status } = req.body;

  if (typeof status !== 'boolean') {
    return res.status(400).json({ mssg: 'invalid status' });
  }

  const foundTodo = await getTodo(_id);
  if (!foundTodo) return res.status(400).json({ msg: 'Not found!' });

  const timestamp = new Date().toISOString();

  const params = {
    ExpressionAttributeNames: {
      '#S': 'status',
      '#U': 'updatedAt',
    },
    ExpressionAttributeValues: {
      ':s': {
        BOOL: !status,
      },
      ':u': {
        S: timestamp,
      },
    },
    Key: {
      _id: {
        S: _id,
      },
    },
    ReturnValues: 'ALL_NEW',
    TableName: TODO_TABLE,
    UpdateExpression: 'SET #S = :s, #U = :u',
  };

  const command = new UpdateItemCommand(params);

  const updateTodo = await client.send(command);

  res.status(200).json(formatData(updateTodo['Attributes']));
});

module.exports = router;
