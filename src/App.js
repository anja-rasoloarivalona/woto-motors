import React, { Component } from 'react';
import './App.css';
import { Route, Switch, withRouter, Redirect } from 'react-router-dom';


/*------------COMPONENTS---------------------*/
import Navtop from './components/navigation/navtop/Navtop';
import Navbar from './components/navigation/navbar/Navbar';
import Footer from './components/footer/Footer'


/*------------PAGES---------------------------*/
import Home from './pages/home/Home';
import Inventory from './pages/inventory/Inventory';
import Car from './pages/car/Car';
import Auth from './pages/auth/Auth';

class App extends Component {
  render() {
    return (
      <div className="app">
        <Navtop />
        <Navbar />

        <Switch>
          <Route path='/' exact component={Home}/>
          <Route path='/inventory' component={Inventory}/>
          <Route path='/car' component={Car}/>
          <Route path='/auth' component={Auth} />
        </Switch>

        <Footer />
        
      </div>
    );
  }
}

export default withRouter(App);
