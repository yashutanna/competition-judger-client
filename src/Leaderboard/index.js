import React, { Component } from 'react';
import './styles.css';
import { Table } from 'reactstrap';
import { withCookies } from 'react-cookie';
import { withRouter } from 'react-router-dom';
import { startCase } from 'lodash';

const questionSorter = (a, b) => {
  if (a.name < b.name) {
    return -1;
  }
  if (a.name > b.name) {
    return 1;
  }
  return 0;
}

const fetchAuthenticated = (url, token, method, body) =>
  fetch(url, {
    method: method || 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': "*"
    },
    body,
  })

class App extends Component {
  constructor(){
    super();
    this.state = {
    }
    this.loadLeaderboard = this.loadLeaderboard.bind(this);
  }

  componentWillMount() {
    this.loadLeaderboard();
  }

  loadLeaderboard() {
    const token = this.props.cookies.get('token');
    const getStandings = () => fetchAuthenticated('http://52.157.232.213:8080/leaderboard/', token)
    .then((res) => res.json())
    .then((leaderboard) => {
      this.setState({
        leaderboard,
      })
    });

    getStandings();
    fetchAuthenticated('http://52.157.232.213:8080/questions/', token)
    .then((res) => res.json())
    .then((questions) => {
      this.setState({
        questions,
      })
    });
  }

  componentDidMount(){
    setInterval(this.loadLeaderboard, 60000);
  }

  render() {
    const tick = (<td className="text-center bg-green"><strong>&#10004;</strong></td>);
    const cross = (<td className="text-center bg-red"><strong>&#10005;</strong></td>);
    const empty = (<td className="text-center"></td>);
    const { leaderboard, questions } = this.state;
    return (
      <div>
        <h3 className="text-center">Leaderboard</h3>
        {
          questions && leaderboard &&
            <Table>
              <thead>
                <tr>
                  <th>University</th>
                  {
                    questions.sort(questionSorter).map(question => (
                      <th className="text-center">{startCase(question.name)}</th>
                    ))
                  }
                </tr>
              </thead>
              <tbody>
                {
                  leaderboard.map((standing) => (
                    <tr>
                      <td>{standing.university} <strong>({standing.score}</strong>)</td>
                      {
                        questions.sort(questionSorter).map(question => (
                          standing.submissions[question.name] === true ? tick : standing.submissions[question.name] === false ? cross : empty
                        ))
                      }
                    </tr>
                  ))
                }
              </tbody>
            </Table>
        }
      </div>
    );
  }
}

export default withRouter(withCookies(App));
