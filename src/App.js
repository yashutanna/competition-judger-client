import React from 'react';
import { Switch, Route, Router } from 'react-router'
import logo from './logo.png';
import './index.css';
import 'whatwg-fetch'

import Home from './Home/'
import Questions from './Questions/'
import { QUESTIONS, SUBMISSIONS, HOME, LEADERBOARD } from './Routes';

import createBrowserHistory from 'history/createBrowserHistory'
import { CookiesProvider } from 'react-cookie';
import { Container } from 'reactstrap';
import Leaderboard from './Leaderboard';

const history = createBrowserHistory();

const App = () => (
  <Router history={history}>
    <CookiesProvider>
      <div className="App-header">
        <img src={logo} alt="logo" className="App-logo"/>
        <h1 className="App-title">Standard Bank Tech Impact Challenge 2018</h1>
      </div>
      <Container className="App-container">
        <Switch>
          <Route exact path={HOME} component={Home}/>
          <Route path={QUESTIONS} component={Questions}/>
          <Route path={LEADERBOARD} component={Leaderboard}/>
          <Route path={SUBMISSIONS} component={() => (
            <div>
                Submission
            </div>
          )}/>
          <Route component={() => (
            <div>
                Not Found
            </div>
          )}/>
        </Switch>
      </Container>
    </CookiesProvider>
  </Router>
);

export default App;
