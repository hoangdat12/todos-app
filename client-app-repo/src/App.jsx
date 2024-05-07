import { useEffect, useState } from 'react';
import Todo from './Todo';
import axios from 'axios';

export default function App() {
  const [todos, setTodos] = useState([]);
  const [content, setContent] = useState('');
  useEffect(() => {
    async function getTodos() {
      const res = await axios.get(
        `${process.env.REACT_APP_SERVER_URL}/api/todos`
      );
      const todos = res.data;

      setTodos(todos);
    }
    getTodos();
  }, []);

  const createNewTodo = async (e) => {
    e.preventDefault();
    if (content.length > 3) {
      const res = await axios.post(
        `${process.env.REACT_APP_SERVER_URL}/api/todos`,
        { todo: content }
      );

      const newTodo = await res.data;

      setContent('');
      setTodos([...todos, newTodo]);
    }
  };

  return (
    <main className='container'>
      <h1 className='title'>Awesome Todos</h1>
      <form className='form' onSubmit={createNewTodo}>
        <input
          type='text'
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder='Enter a new todo...'
          className='form__input'
          required
        />
        <button className='form__button' type='submit'>
          Create Todo
        </button>
      </form>
      <div className='todos'>
        {todos.length > 0 &&
          todos.map((todo) => (
            <Todo key={todo._id} todo={todo} setTodos={setTodos} />
          ))}
      </div>
    </main>
  );
}
