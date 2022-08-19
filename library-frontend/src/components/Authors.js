import { useMutation, useQuery } from "@apollo/client";
import { useEffect, useState } from "react";
import Select from "react-select";
import { ALL_AUTHORS, SET_BORN } from "../queries";

const Authors = (props) => {
  const [born, setBorn] = useState("");
  const [selectedName, setSelectedName] = useState(null);
  const [names, setNames] = useState([]);

  const [editBorn] = useMutation(SET_BORN, {
    refetchQueries: [
      {
        query: ALL_AUTHORS,
      },
    ],
  });

  const result = useQuery(ALL_AUTHORS);

  useEffect(() => {
    if (result.data) {
      setNames(
        result.data.allAuthors.map((v) => {
          return { value: v.name, label: v.name };
        })
      );
      console.log("names:", names);
    }
  }, [result.data]);

  if (!props.show) {
    return null;
  }

  console.log(result);

  if (result.loading) {
    return <div>loading...</div>;
  }

  const clickSetBorn = () => {
    if (selectedName && born) {
      console.log("name:", selectedName.value);
      console.log("born:", born);
      editBorn({
        variables: {
          name: selectedName.value,
          born: Number(born),
        },
      });

      setBorn("");
    }
  };

  return (
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>born</th>
            <th>books</th>
          </tr>
          {result.data.allAuthors.map((a) => (
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {props.token ? (
        <div>
          <h2>Set birthyear</h2>
          <div>
            <div>
              <Select
                defaultValue={selectedName}
                onChange={setSelectedName}
                options={names}
              />
            </div>
            <div>
              born
              <input
                type="number"
                value={born}
                onChange={({ target }) => setBorn(target.value)}
              />
            </div>
            <button onClick={clickSetBorn}>update author</button>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default Authors;
