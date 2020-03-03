import React, { Component } from 'react'
import './Footer.css';
import IconSvg from '../../utilities/svg/svg';
import DropDownList from '../DropDownList/DropDownList';
import * as actions from '../../store/actions'
import {connect} from 'react-redux'
import {withRouter} from 'react-router-dom'

class Footer extends Component {

    state = {
        susbscribed: false,
        subscribeInput: ''
    }
    changeInputHandler = value => {
        this.setState({ subscribeInput: value })
    }

    subscribeHandler = () => {
        this.setState({
            susbscribed: true,
            subscribeInput: ''
        })
    }

    setCurrencyHandler = currency => {
        this.props.history.push({
            pathname: this.props.history.pathname,
            search: `lang=${this.props.lang}&currency=${currency}`
        })
        this.props.setCurrency(currency)
        
        window.scrollTo(0 , 0)
    }
    render() {

        const {susbscribed, subscribeInput} = this.state
        const { hide } = this.props
        return (
            <footer className={`footer ${hide ? 'hide' : ''}`}>
            <ul className="footer__list">

                <li className="footer__list__group">
                    <div className="footer__list__item">
                        <h3 className="footer__title">WOTO Motors</h3>
                        <p>
                            Aliquam non lacus nec ligula efficitur malesuada ac sit amet orci. Aliquam volutpat, sapien eu blandit laoreet, sapien quam semper nunc, a mollis turpis lacus vitae nibh. Nullam eleifend varius dolor, quis dapibus sem tempor eget. Nulla sed aliquam nibh. In eu luctus tortor. Vestibulum ullamcorper ex nisl,
                        </p>
                    </div>
                    <div className="footer__list__item">
                        <h3 className="footer__title">Site map</h3>
                        <ul className="footer__list__item__list">
                            <li className="footer__list__item__list__item">
                               <a href="/">Home</a>
                            </li>
                            <li className="footer__list__item__list__item">
                                <a href="/inventory">Inventory</a>
                            </li>
                            <li className="footer__list__item__list__item">
                                <a href="/services">Services</a>
                            </li>
                        </ul>
                    </div>
                </li>



                <li className="footer__list__group">
                    <div className="footer__list__item">
                        <h3 className="footer__title">Subscribe</h3>

                        <div className="footer__inputContainer">
                            <input className="footer__input"
                                value={subscribeInput}
                                type="email"
                                placeholder="email"
                                onChange={e => this.changeInputHandler(e.target.value)}
                            />
                            <IconSvg icon="send"
                                onClick={this.subscribeHandler}
                            />
                        </div>
                        
                        {susbscribed && (
                            <p>You've been subscribed. Thank you for joining us</p>
                        )}
                         {!susbscribed && (
                            <p>Get latest updates and offers</p>
                        )}

                       
                    </div>
                    <div className="footer__list__item">
                        <h3 className="footer__title">Parameters</h3>
                        <ul className="footer__list__item__list">
                            <li className="footer__list__item__list__item">
                                <DropDownList 
                                    value={this.props.lang}
                                    list={['english', 'spanish', 'french']}
                                    selectItemHandler={this.props.setLang}
                                />
                            </li>
                            <li className="footer__list__item__list__item">
                                <DropDownList 
                                    value={this.props.currency}
                                    list={['CAD', 'USD', 'EUR']}
                                    selectItemHandler={this.setCurrencyHandler}
                                />
                            </li>
                            
                     </ul>
                    </div>     
                </li>    
            </ul>


            <div className="footer__copyRight">
                <span>&copy; Anja Rasoloarivalona - 2019</span>
                <ul className="footer__socialNetwork__list">
                        <IconSvg icon="facebook"/>
                        <IconSvg icon="instagram"/>
                        <IconSvg icon="twitter"/>
                        <IconSvg icon="google-plus"/>
                    </ul>
            </div>
        </footer>
        )
    }
}


const mapStateToProps = state => {
    return {
        lang: state.parameters.lang,
        currency: state.parameters.currency
    }
}

const mapDispacthToProps = dispatch => {
    return {
        setLang: lang => dispatch(actions.setLang(lang)),
        setCurrency: currency => dispatch(actions.setCurrency(currency))
    }
}

export default connect(mapStateToProps, mapDispacthToProps)(withRouter(Footer));

