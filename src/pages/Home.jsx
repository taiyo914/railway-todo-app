import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useCookies } from "react-cookie";
import axios from "axios";
import { Header } from "../components/Header";
import { url } from "../const";
import "./home.scss";

export const Home = () => {
  const [isDoneDisplay, setIsDoneDisplay] = useState("todo"); // todo->未完了 done->完了
  const [lists, setLists] = useState([]);
  const [selectListId, setSelectListId] = useState();
  const [tasks, setTasks] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [cookies] = useCookies();
  const handleIsDoneDisplayChange = (e) => setIsDoneDisplay(e.target.value);
  useEffect(() => {
    axios
      .get(`${url}/lists`, {
        headers: {
          authorization: `Bearer ${cookies.token}`,
        },
      })
      .then((res) => {
        setLists(res.data);
      })
      .catch((err) => {
        setErrorMessage(`リストの取得に失敗しました。${err}`);
      });
  }, []);

  useEffect(() => {
    const listId = lists[0]?.id;
    if (typeof listId !== "undefined") {
      setSelectListId(listId);
      axios
        .get(`${url}/lists/${listId}/tasks`, {
          headers: {
            authorization: `Bearer ${cookies.token}`,
          },
        })
        .then((res) => {
          setTasks(res.data.tasks);
          console.log(res.data.tasks); //デバッグ用
        })
        .catch((err) => {
          setErrorMessage(`タスクの取得に失敗しました。${err}`);
        });
    }
  }, [lists]);

  const handleSelectList = (id) => {
    setSelectListId(id);
    axios
      .get(`${url}/lists/${id}/tasks`, {
        headers: {
          authorization: `Bearer ${cookies.token}`,
        },
      })
      .then((res) => {
        setTasks(res.data.tasks);
      })
      .catch((err) => {
        setErrorMessage(`タスクの取得に失敗しました。${err}`);
      });
  };

  // Enterを押すとhandleSelectList関数が実行される関数を追加
  const handleKeyDown = (event, id) => {
    if (event.key === 'Enter') {
      event.preventDefault(); //Chromeはなくても動くが一応つけとく
      handleSelectList(id);
    }
  };
  // ここまで

  return (
    <div>
      <Header />
      <main className="taskList">
        <p className="error-message">{errorMessage}</p>
        <div>
          <div className="list-header">
            <h2>リスト一覧</h2>
            <div className="list-menu">
              <p>
                <Link to="/list/new">リスト新規作成</Link>
              </p>
              <p>
                <Link to={`/lists/${selectListId}/edit`}>
                  選択中のリストを編集
                </Link>
              </p>
            </div>
          </div>

          {/* ここを編集 */}
          <ul className="list-tab" role="tablist"> {/* roleを追加 */}
            {lists.map((list) => {
              const isActive = list.id === selectListId;
              return (
                <li
                  key ={list.id}
                  className={`list-tab-item ${isActive ? "active" : ""}`}
                  onClick={() => handleSelectList(list.id)}
                // ここから変更
                  onKeyDown={(e) => handleKeyDown(e, list.id)}
                  tabIndex={0} 
                  // ここから下は機能上は不要だが、アクセシビリティをより高めるための記述
                  role = "tab"
                  aria-selected={selectListId === list.id}
                // ここまで変更
                >
                  {list.title}
                </li>
              );
            })}
          </ul>
          {/* ここを編集 */}

          <div className="tasks">
            <div className="tasks-header">
              <h2>タスク一覧</h2>
              <Link to="/task/new">タスク新規作成</Link>
            </div>
            <div className="display-select-wrapper">
              <select
                onChange={handleIsDoneDisplayChange}
                className="display-select"
              >
                <option value="todo">未完了</option>
                <option value="done">完了</option>
              </select>
            </div>
            <Tasks
              tasks={tasks}
              selectListId={selectListId}
              isDoneDisplay={isDoneDisplay}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

// Tasksコンポーネント
const Tasks = (props) => {
  const { tasks, selectListId, isDoneDisplay } = props;
  if (tasks === null) return <></>;

  //limitの表示を整える関数
  const formatLimitString =(limit) =>{
    return (
      new Date(limit).toLocaleDateString("ja-JP",{
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit',second: undefined, 
        timeZone: 'UTC' // UTCタイムゾーンを指定
      })
    )
  }
  //残り日時を計算する関数
  const calculateRemainingTime = (limit) => {
    const now = new Date();
    const deadline = new Date(limit);
    const difference = deadline - now;
    if (difference > 0) {
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      return `${days}d ${hours}h ${minutes}m`;
    } else {
      return "期限切れ";
    }
  };

//完了の画面
  if (isDoneDisplay == "done") {
    return (
      <ul>
        {tasks
          .filter((task) => {
            return task.done === true;
          })
          .map((task, key) => {
            return(
              <li key={key} className="task-item">
              <Link
                to={`/lists/${selectListId}/tasks/${task.id}`}
                className="task-item-link"
              >
                {task.title}
                <br />
                {task.done ? "完了" : "未完了"}

                {task.limit ? (
                  <>
                    <br/>
                    期限：{formatLimitString(task.limit)}
                    <br/>
                    残り日時：{calculateRemainingTime(task.limit)} 
                  </>
                ) : ""}

              </Link>
            </li>
            )
          })}
      </ul>
    );
  }

//未完了の画面
  return (
    <ul>
      {tasks
        .filter((task) => {
          return task.done === false;
        })
        .map((task, key) => {
          return(
            <li key={key} className="task-item">
              <Link
                to={`/lists/${selectListId}/tasks/${task.id}`}
                className="task-item-link"
              >
                {task.title}
                <br />
                {task.done ? "完了" : "未完了"}

                {task.limit ? (
                  <>
                    <br/>
                    期限：{formatLimitString(task.limit)}
                    <br/>
                    残り日時：{calculateRemainingTime(task.limit)} 
                  </>
                ) : ""}

              </Link>
          </li>
          )
        })}
    </ul>
  );
};
