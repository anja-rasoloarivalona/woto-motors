import React from 'react';
import './HomeInventory.css';
import IconSvg from '../../../utilities/svg/svg';
import Button from '../../../components/button/Button';


import intro1 from '../../../assets/img/intro1.jpeg';
import intro2 from '../../../assets/img/intro2.jpg';
import intro3 from '../../../assets/img/intro3.jpg';
import intro4 from '../../../assets/img/intro4.jpg';

const homeInventory = props => {

    let cars = props.carsHomeInventory;

    console.log('carrs', cars)

    return (
        <div className="home-inventory">
            <ul className="home-inventory__list">

            {
                cars.map(product => (

                <li className="home-inventory__list__item" key={product._id}>
                    <img src={product.general[0].mainImgUrl} className="home-inventory__list__item__img" alt="car"/>
                    
                    <div className="home-inventory__list__item__details">
                        <div className="home-inventory__list__item__details__model">
                            <span>{product.general[0].made}&nbsp;{product.general[0].model}</span>
                            <span>{product.general[0].year}</span>
                        </div>
                        <div className="home-inventory__list__item__details__price">
                            {product.general[0].price} &nbsp; MRU
                        </div>
                    </div>

                    <ul className="home-inventory__list__item__details__specList">
                        <li className="home-inventory__list__item__details__specList__item">
                            <span>{product.general[0].nbKilometers}</span>
                            <IconSvg icon="road"/>    
                        </li>
                        <li className="home-inventory__list__item__details__specList__item">
                            <span>{product.general[0].gazol}</span>
                            <IconSvg icon="gas-station"/>
                        </li>
                        <li className="home-inventory__list__item__details__specList__item">
                            <span>{product.general[0].transmissionType}</span>
                            <IconSvg icon="gear"/>
                        </li>
                    </ul>
                </li>
                ))
            }
            </ul>
            <Button color="primary">
                Voir plus
            </Button>
        
        </div>
    )
}

export const HomeInventoryMemo = React.memo(homeInventory);