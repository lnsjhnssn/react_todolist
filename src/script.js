const key = "1225";

const checkStatus = (response) => {
  if (response.ok) {
    // .ok returns true if response status is 200-299
    return response;
  }
  throw new Error("Error 404 or 500");
};

const json = (response) => response.json();

class Task extends React.Component {
  render() {
    const { task, onDelete, onComplete } = this.props;
    const { id, content, completed } = task;
    return (
      <div className="task">
        <input
          type="checkbox"
          onChange={() => onComplete(id, completed)}
          checked={completed}
        />
        <p>{content}</p>
        <button onClick={() => onDelete(id)}>Delete</button>
      </div>
    );
  }
}

class ToDoList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      new_task: "",
      tasks: [],
      filter: "all",
    };

    this.fetchTasks = this.fetchTasks.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.deleteTask = this.deleteTask.bind(this);
    this.toggleComplete = this.toggleComplete.bind(this);
    this.toggleFilter = this.toggleFilter.bind(this);
  }

  toggleFilter(e) {
    console.log(e.target.name);
    this.setState({
      filter: e.target.name,
    });
  }

  componentDidMount() {
    this.fetchTasks(); // get tasks on mount
  }

  fetchTasks() {
    fetch(`https://fewd-todolist-api.onrender.com/tasks?api_key=${key}`)
      .then(checkStatus)
      .then(json)
      .then((response) => {
        console.log(response);
        this.setState({ tasks: response.tasks });
      })
      .catch((error) => {
        console.error(error.message);
      });
  }

  handleChange(event) {
    this.setState({ new_task: event.target.value });
  }

  handleSubmit(event) {
    event.preventDefault();
    let { new_task } = this.state;
    new_task = new_task.trim();
    if (!new_task) {
      return;
    }

    fetch(`https://fewd-todolist-api.onrender.com/tasks?api_key=${key}`, {
      method: "POST",
      mode: "cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        task: {
          content: new_task,
        },
      }),
    })
      .then(checkStatus)
      .then(json)
      .then((data) => {
        this.setState({ new_task: "" });
        this.fetchTasks();
      })
      .catch((error) => {
        this.setState({ error: error.message });
        console.log(error);
      });
  }

  deleteTask(id) {
    if (!id) {
      return; // if no id is supplied, early return
    }
    fetch(`https://fewd-todolist-api.onrender.com/tasks/${id}?api_key=${key}`, {
      method: "DELETE",
      mode: "cors",
    })
      .then(checkStatus)
      .then(json)
      .then((data) => {
        this.fetchTasks(); // fetch tasks after delete
      })
      .catch((error) => {
        this.setState({ error: error.message });
        console.log(error);
      });
  }

  toggleComplete(id, completed) {
    if (!id) {
      return; // early return if no id
    }
    const newState = completed ? "active" : "complete";
    fetch(
      `https://fewd-todolist-api.onrender.com/tasks/${id}/mark_${newState}?api_key=${key}`,
      {
        method: "PUT",
        mode: "cors",
      }
    )
      .then(checkStatus)
      .then(json)
      .then((data) => {
        this.fetchTasks();
      })
      .catch((error) => {
        this.setState({ error: error.message });
        console.log(error);
      });
  }

  render() {
    const { new_task, tasks, filter } = this.state;

    return (
      <div>
        <div>
          <div className="list-container">
            <h1>To Do List</h1>
            <form className="form-new-task" onSubmit={this.handleSubmit}>
              <input
                className="input-new-task"
                type="text"
                placeholder="Add new task"
                value={new_task}
                onChange={this.handleChange}
              />
              <button type="submit">Add</button>
            </form>
            {tasks.length > 0 ? (
              tasks
                .filter((task) => {
                  if (filter === "all") {
                    return true;
                  } else if (filter === "active") {
                    return !task.completed;
                  } else {
                    return task.completed;
                  }
                })
                .map((task) => {
                  return (
                    <Task
                      key={task.id}
                      task={task}
                      onDelete={this.deleteTask}
                      onComplete={this.toggleComplete}
                    />
                  );
                })
            ) : (
              <p className="para-no-tasks">No tasks</p>
            )}

            <div className="mt-3">
              <label>
                <input
                  type="checkbox"
                  name="all"
                  checked={filter === "all"}
                  onChange={this.toggleFilter}
                />{" "}
                All
              </label>
              <label>
                <input
                  type="checkbox"
                  name="active"
                  checked={filter === "active"}
                  onChange={this.toggleFilter}
                />{" "}
                Active
              </label>
              <label>
                <input
                  type="checkbox"
                  name="completed"
                  checked={filter === "completed"}
                  onChange={this.toggleFilter}
                />{" "}
                Completed
              </label>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const container = document.getElementById("root");
const root = ReactDOM.createRoot(container);
root.render(<ToDoList />);
