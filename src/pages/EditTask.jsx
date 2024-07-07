import React, { useEffect, useState } from "react";
import { Header } from "../components/Header";
import axios from "axios";
import { useCookies } from "react-cookie";
import { url } from "../const";
import { useNavigate, useParams } from "react-router-dom";
import "./editTask.scss";

export const EditTask = () => {
  const navigate = useNavigate();
  const { listId, taskId } = useParams();
  const [cookies] = useCookies();
  const [title, setTitle] = useState("");
  const [detail, setDetail] = useState("");
  const [isDone, setIsDone] = useState();
  const [errorMessage, setErrorMessage] = useState("");
  const handleTitleChange = (e) => setTitle(e.target.value);
  const handleDetailChange = (e) => setDetail(e.target.value);
  const handleIsDoneChange = (e) => setIsDone(e.target.value === "done");

  // ここから変更
  const [limit, setLimit] = useState("");
  const handleLimitChange = (e) => {
    setLimit(e.target.value)
    console.log(`Type: ${typeof e.target.value}, Value: ${e.target.value}`); //デバッグ用
  };
  // ここまで変更

  const onUpdateTask = () => {
    console.log(isDone);
    //ここから変更
    let data ={
      title: title,
      detail: detail,
      done: isDone,
    }
    data = limit ? {...data, limit:limit +":00Z"}:{...data, limit:null} 
      // limit:nullで送信しても、エラーは出ないがlimitは更新されない
    //ここまで変更
    axios
      .put(`${url}/lists/${listId}/tasks/${taskId}`, data, {
        headers: {
          authorization: `Bearer ${cookies.token}`,
        },
      })
      .then((res) => {
        console.log(res.data);
        navigate("/");
      })
      .catch((err) => {
        setErrorMessage(`更新に失敗しました。${err}`);
      });
  };

  const onDeleteTask = () => {
    axios
      .delete(`${url}/lists/${listId}/tasks/${taskId}`, {
        headers: {
          authorization: `Bearer ${cookies.token}`,
        },
      })
      .then(() => {
        navigate("/");
      })
      .catch((err) => {
        setErrorMessage(`削除に失敗しました。${err}`);
      });
  };

  useEffect(() => {
    axios
      .get(`${url}/lists/${listId}/tasks/${taskId}`, {
        headers: {
          authorization: `Bearer ${cookies.token}`,
        },
      })
      .then((res) => {
        const task = res.data;
        console.log(`Bearer ${cookies.token}`)
        console.log(task)
        setTitle(task.title);
        setDetail(task.detail);
        setIsDone(task.done);
        if(task.limit){setLimit(task.limit.replace(/:00Z$/,''));} 
          //もしtask.limitの値があれば、limitの状態を更新(ただし、最後の:00Zという文字列は削除)
        //デバッグ用に情報を取得
          // console.log(listId)
          // console.log(taskId)
          // console.log(`Bearer ${cookies.token}`)
      })
      .catch((err) => {
        setErrorMessage(`タスク情報の取得に失敗しました。${err}`);
      });
  }, []);

  return (
    <div>
      <Header />
      <main className="edit-task">
        <h2>タスク編集</h2>
        <p className="error-message">{errorMessage}</p>
        <form className="edit-task-form">
          <label>タイトル</label>
          <br />
          <input
            type="text"
            onChange={handleTitleChange}
            className="edit-task-title"
            value={title}
          />
          <br />

          {/* ここから変更 */}
          <label >期限</label>
          <br/>
          <input 
            type="datetime-local" 
            onChange ={handleLimitChange}
            value ={limit}
            className="edit-task-limit"
          />
          <br/>
          {/* ここまで変更 */}

          <label>詳細</label>
          <br />
          <textarea
            type="text"
            onChange={handleDetailChange}
            className="edit-task-detail"
            value={detail}
          />
          <br />
          <div>
            <input
              type="radio"
              id="todo"
              name="status"
              value="todo"
              onChange={handleIsDoneChange}
              checked={isDone === false ? "checked" : ""}
            />
            未完了
            <input
              type="radio"
              id="done"
              name="status"
              value="done"
              onChange={handleIsDoneChange}
              checked={isDone === true ? "checked" : ""}
            />
            完了
          </div>
          <button
            type="button"
            className="delete-task-button"
            onClick={onDeleteTask}
          >
            削除
          </button>
          <button
            type="button"
            className="edit-task-button"
            onClick={onUpdateTask}
          >
            更新
          </button>
        </form>
      </main>
    </div>
  );
};
