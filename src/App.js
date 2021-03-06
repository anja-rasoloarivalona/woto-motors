import React, { Component, Fragment } from 'react';
import './App.css';
import { Route, Switch, withRouter } from 'react-router-dom';
import { connect} from 'react-redux';
import * as actions from './store/actions'
import openSocket from 'socket.io-client';
// import { Spring } from 'react-spring/renderprops'
import notification from './assets/eventually.mp3'
import { IntlProvider} from 'react-intl';
import messages from './messages'
import queryString from 'query-string'

/*------------COMPONENTS---------------------*/
import Navtop from './components/navigation/navtop/Navtop';
import Navbar from './components/navigation/navbar/Navbar';
import MobileNav from './components/navigation/mobileNav/MobileNav'
import Footer from './components/footer/Footer'
import Chat from './components/chat/Chat';
import Loader from './components/loader/Loader'


/*------------PAGES---------------------------*/
import Home from './pages/home/Home';
import Inventory from './pages/inventory/Inventory';
import SingleCar from './pages/car/Car';
import Auth from './pages/auth/Auth';
import Account from './pages/account/Account';
import Services from './pages/Services/Services'

/*-----------UTILITIES-----------*/
import { timeStampGenerator } from './utilities/timeStampGenerator';

class App extends Component {

  state = {
    carsHomeIntro : [],
    carsHomeInventory : [],
    loading: false,
    hideScrollBar: false,
    hideFooter: false,
    scrolled: false,
    scrollDirection: 'bottom',

    lang: "english"
  }

  componentDidMount(){
    window.addEventListener('scroll', this.listenToScroll)
    this.scrollPos = 0;
    this.scrollDirection = 'bottom'

    // let url = 'http://api.currencylayer.com/live?access_key=393f7172bfdb3cbdf353b2fd78462005&currencies=CAD,EUR'
    // let url = 'http://api.currencylayer.com/list?access_key=393f7172bfdb3cbdf353b2fd78462005'
   
    // fetch(url)
    // .then(res => {
    //   return res.json()
      
    // })
    // .then( resData => {
    //   console.log('curr', resData)
    // })
    // .catch(err => {
    //   console.log(err)
    // })

    // console.log('histor', this.props.history, this.props.location);

    // this.props.history.push({
    //   pathname: this.props.history.pathname,
    //   search: `lang=${this.props.lang}&currency=${this.props.currency}`
    // })


    let parsedQuery = queryString.parse(this.props.location.search);

    

    if(Object.keys(parsedQuery).length > 0){
      this.props.setLang(parsedQuery.lang)
      this.props.setCurrency(parsedQuery.currency)
    } else {
      this.props.history.push({
            pathname: this.props.history.pathname,
            search: `currency=${this.props.currency}&lang=${this.props.lang}`
          })
    }
    




    this.setState({ loading: true});
    this.initAppDataHandler();
    const token = localStorage.getItem('woto-token');
    const expiryDate = localStorage.getItem('woto-expiryDate');
    const userId = localStorage.getItem('woto-userId');
    const userName= localStorage.getItem('woto-userName');


    if(!token || !expiryDate){
        console.log('NO TOKEN')
        return
    }
    if(new Date(expiryDate) <= new Date()){
      console.log('Token not valid anymore')
      this.props.setLoginStateToFalse()
      return 
    }

    if(this.props.location.pathname.includes('/my-account')){
      this.setState({ hideFooter: true})
    }
    let loginData = {
        isAuth: true,
        token: token,
        userId: userId,
        userName: userName
    }
    this.props.setLoginStateToTrue(loginData);
    this.initUserFavoriteProducts(loginData.userId);
    let timeStamp = timeStampGenerator();
    this.startConnection(userId, timeStamp);
  }

  listenToScroll = () => {
    const winScroll = document.body.scrollTop || document.documentElement.scrollTop
    const isTop = winScroll < 50;
    if(!isTop && this.scrollPos > winScroll){
      this.scrollPos = winScroll
      this.setState({ scrolled: true, scrollDirection: "top" })
    } 
    if(!isTop && this.scrollPos < winScroll){
      this.scrollPos = winScroll
      this.setState({ scrolled: true, scrollDirection: "bottom" })
    } 
    if(isTop){
      this.scrollPos = winScroll
      this.setState({ scrolled: false })
    }
  }

  initAppDataHandler = () => {
      let url = 'https://africauto.herokuapp.com/product/init';
      let method = 'GET';
      fetch( url, {
        method: method,
        headers: {
          'Content-type': 'application/json'
        },
      })
      .then( res => {
        if(res.status !== 200 && res.status !== 201){
          throw new Error('Error fetching products')
        }
        return res.json()
      })
      .then(resData => {
        this.props.initAppData(resData)
        this.setState({ 
          carsHomeIntro: resData.publicityProducts, 
          carsHomeInventory: resData.homeInventoryProducts,
          loading: false
        })
      })
      .catch(err => {
        console.log(err)
      })     
  }

  componentDidUpdate(prevProps){  
     if( prevProps.location.pathname !== this.props.location.pathname){


       if(this.props.location.pathname.includes('/my-account')){ 
        this.setState({ hideFooter: true})
       } else {
        this.setState({ hideFooter: false})   
       }


       if(!this.props.location.pathname.includes('/inventory')){
            this.props.history.push({
                  pathname: this.props.history.pathname,
                  search: `currency=${this.props.currency}&lang=${this.props.lang}`
                })
          }
     }  
     
     if(prevProps.lang !== this.props.lang){
       this.setState({ lang: this.props.lang})
     }
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.listenToScroll)
  }

  startConnection = (userId, timeStamp) => {
        fetch('https://africauto.herokuapp.com/auth/start-connection',{
          method: 'POST',
          headers: {
            'Content-type': 'application/json'
          },
          body: JSON.stringify({
            userId: userId,
            timeStamp: timeStamp
          })
        })
        .then(res => {
          if(res.status === 401){
            throw new Error('UserId not valid')
          }

          if(res.status !== 200 && res.status !== 201){
            throw new Error('Could not update last connection')
          }
          return res.json()
        })
        .then( resData => {
          let socket = openSocket('https://africauto.herokuapp.com/', {query: `data=${userId} ${resData.connectionId}`});
          socket.connect();
          this.props.setConnectionId(resData.connectionId)
        })
        .catch(err => {
          console.log(err)
        })
  }

  logoutHandler = () => {
      this.props.setLoginStateToFalse();
      let timeStamp = timeStampGenerator()
      const userId = localStorage.getItem('woto-userId');
      const connectionId = this.props.connectionId;
      this.endConnection(userId, connectionId, timeStamp, true);
      this.props.history.push('/')
  }

  endConnection = (userId, connectionId, timeStamp, logout) => {
      fetch('https://africauto.herokuapp.com/auth/end-connection',{
        method: 'POST',
        headers: {
          'Content-type': 'application/json'
        },
        body: JSON.stringify({
          userId: userId,
          connectionId: connectionId,
          timeStamp: timeStamp
        })
      })
      .then(res => {
        if(res.status === 401){
          throw new Error('UserId not valid')
        }
        if(res.status !== 200 && res.status !== 201){
          throw new Error('Could not update last connection')
        }
        return
      })
      .then(() => {
          localStorage.removeItem('woto-connectionId');

          if(logout === true){
            localStorage.removeItem('woto-token');
            localStorage.removeItem('woto-expiryDate');
            localStorage.removeItem('woto-userId');
            localStorage.removeItem('woto-userName');
          }
          
      })
      .catch(err => {
        console.log(err)
      })
  }

  initUserFavoriteProducts = userId => {
    let url = 'https://africauto.herokuapp.com/user/favorites/' + userId;
    fetch( url, {
      headers: {
        'Content-type': 'application/json'
      }
    })
    .then( res => {
      if(res.status !== 200 && res.status !== 201){
        throw new Error('Error fetching products')
      }
      return res.json()
    })
    .then(resData => {
     this.props.setUserFavoriteProducts(resData.favorites)
    })
    .catch(err => {
      console.log(err)
    })

  }

  showScrollBarHandler = () => {
    this.setState({ hideScrollBar: false}, () => document.body.className = "")
  }
  hideScrollBarHandler = () => {
    this.setState({ hideScrollBar: true}, () => document.body.className="hideScrollBar")
  }

  playNotificationSound = () => {
    this.player.play();
  }
  
  render() {
    const { loading , hideScrollBar, hideFooter,scrolled, scrollDirection, lang} = this.state
    let app;
    let windowWidth = window.innerWidth;

    let langManager = {
      french: "fr",
      english: "en"
    }


    if(loading === true || !this.props.brandAndModelsData){
      app = <Loader />

    } else {
      app = (
        // <Spring
        //   from={{marginTop: 1000}}
        //   to = {{ marginTop: 0}}
        //   config={{delay: 500}}>
        //   {props => (
        //       <div style={props}>


                <div className={`app`}>
                    {windowWidth > 850 && (
                        <Fragment>
                          <Navtop scrolled={scrolled} scrollDirection={scrollDirection}/>
                          <Navbar scrolled={scrolled} scrollDirection={scrollDirection}/>
                        </Fragment>
                    )}
                    {windowWidth <= 850 && (
                      <MobileNav logoutHandler={this.logoutHandler}/>
                    )}
                    <audio src={notification} ref={ref => this.player = ref}  />
                    {windowWidth > 600 && this.props.auth && this.props.token && this.props.userId && <Chat playNotificationSound={this.playNotificationSound}/>}
                    <Switch>
                    <Route exact path={`/`} render={(props) => <Home {...props} carsHomeIntro={this.state.carsHomeIntro} carsHomeInventory={this.state.carsHomeInventory}/>}/>
                        <Route path={'/inventory/:prodId'} render={(props) => <SingleCar {...props} hideScrollBar={hideScrollBar} showScrollBarHandler={this.showScrollBarHandler} hideScrollBarHandler={this.hideScrollBarHandler} /> }/>
                        <Route path={`/inventory`} component={Inventory}/>
                        <Route path={'/auth'} component={Auth} />
                        <Route path={'/my-account'} render={(props) => <Account {...props} logoutHandler={this.logoutHandler} /> }/>
                        <Route path={'/services'} component={Services} /> 
                    </Switch>
                    
                    <Footer hide={hideFooter}/>      
                </div>



        //       </div>
        //     )
        //   }
        // </Spring>
      )
    }   
    return (
      <IntlProvider locale={langManager[lang]} 
              messages={messages[langManager[lang]]}
      >
        {app}
      </IntlProvider>
    )
  }
}


const mapStateToProps = state => {
  return {
    auth: state.auth.auth,
    token: state.auth.token,
    userId: state.auth.userId,
    connectionId: state.auth.connectionId,
    brandAndModelsData: state.product.brandAndModelsData,
    lang: state.parameters.lang,
    currency: state.parameters.currency
  }
}

const mapDispatchToProps = dispatch => {
  return {
    setLoginStateToTrue: (data) => dispatch(actions.setLoginStateToTrue(data)),
    setLoginStateToFalse: () => dispatch(actions.setLoginStateToFalse()),
    setConnectionId: connectionId => dispatch(actions.setConnectionId(connectionId)),
    initAppData: data => dispatch(actions.initAppData(data)),
    setUserFavoriteProducts: products => dispatch(actions.setUserFavoriteProducts(products)),
    setLang: lang => dispatch(actions.setLang(lang)),
    setCurrency: currency => dispatch(actions.setCurrency(currency)),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(App));
