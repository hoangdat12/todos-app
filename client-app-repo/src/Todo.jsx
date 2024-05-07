import axios from 'axios';

export default function Todo(props) {
  const { todo, setTodos } = props;

  const updateTodo = async (todoId, todoStatus) => {
    const res = await axios.put(
      `${process.env.REACT_APP_SERVER_URL}/api/todos/${todoId}`,
      { status: todoStatus }
    );

    if (res.status === 200) {
      setTodos((currentTodos) => {
        return currentTodos.map((currentTodo) => {
          if (currentTodo._id === todoId) {
            return { ...currentTodo, status: !currentTodo.status };
          }
          return currentTodo;
        });
      });
    }
  };

  const deleteTodo = async (todoId) => {
    const res = await axios.delete(
      `${process.env.REACT_APP_SERVER_URL}/api/todos/${todoId}`
    );

    const json = await res.data;

    if (json.acknowledged) {
      setTodos((currentTodos) => {
        return currentTodos.filter((currentTodo) => currentTodo._id !== todoId);
      });
    }
  };

  return (
    <div className='todo'>
      <p>{todo.todo}</p>
      <div className='mutations'>
        <button
          className='todo__status'
          onClick={() => updateTodo(todo._id, todo.status)}
        >
          {todo.status ? '☑' : '☐'}
        </button>
        <button className='todo__delete' onClick={() => deleteTodo(todo._id)}>
          🗑️
        </button>
      </div>
    </div>
  );
}
