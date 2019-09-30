import React from 'react';
import './Navbar.css';
import { NavLink } from 'react-router-dom';


import Button from '../../button/Button';


const navbar = () => {
    return (    
            <nav className="navbarContainer">
                <ul className="navbar__list">
                    <NavLink to="/" exact className="navbar__list__item">
                        Accueil
                    </NavLink>
                    <NavLink to="/inventaire" className="navbar__list__item">
                        Inventaire
                    </NavLink>
                    <NavLink to="/services" className="navbar__list__item">
                        Services
                    </NavLink>
                    <NavLink to="/contact" className="navbar__list__item">
                        Contact
                    </NavLink>
                    <NavLink to="/car" className="navbar__list__item">
                        CAR
                    </NavLink>
                </ul>

                <Button color='primary' link='/auth'
                        customClass='auth__cta'>
                    Se connecter
                </Button>
            </nav>
        
    )
}

export default navbar;
