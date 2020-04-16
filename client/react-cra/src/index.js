import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

import Checkout from './components/Checkout';
import Success from './components/Success';
import Canceled from './components/Canceled';
import Footer from './components/Footer';

import './css/normalize.css';
import './css/global.css';

function App() {
  return (
    <>
      <Router>
        <Switch>
          <Route path="/success.html">
            <Success />
          </Route>
          <Route path="/canceled.html">
            <Canceled />
          </Route>
          <Route path="/">
            <Checkout />
          </Route>
        </Switch>
      </Router>
      <Footer />
    </>
  );
}

ReactDOM.render(<App />, document.getElementById('root'));
