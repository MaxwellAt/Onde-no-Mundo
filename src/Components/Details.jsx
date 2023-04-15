import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { NavLink } from "react-router-dom";

export default function Details({valIsDarkMode}) {

    const { Name } = useParams();
    
    const [data, setData] = useState([]);
    const [ languages, setLang ] = useState("");
    const [flag, setFlag] = useState([]);
    const [currencies, setCurrencies] = useState([])
    const [borders, setBorders] = useState()

    useEffect(() => {
        fetch("./data.json")
            .then(resp => resp.json())
            .then(resp => {
                const data = resp.filter(country => country.name === Name);
                setData(data[0]);
                // a partir de data pegue todas as langs e armazene em languages
                const langs = data[0].languages.map(lang => lang.name);
                setLang(langs);
                // pegue a flag e armazene em flag
                const flag = data[0].flag;
                setFlag(flag);
                const currencies = data[0].currencies.map(lang => lang.code);
                setCurrencies(currencies[0]);
                const borders = data[0].borders.map(x=>{return <div className="btn btn-light" key={x.key}>{x}</div> })
                setBorders(borders);
            })

    }, [Name]);

    const backButton = (
        <NavLink className={`button is-${valIsDarkMode ? "dark" : "light"}`} to={`/`}>
            <span className="icon">
                <FontAwesomeIcon icon={faArrowLeft} />
            </span>
            <span>Back</span>
        </NavLink>
    )


    const infos = (
        <div className="my-table">
            <h1><strong>{Name}</strong></h1>
            <table >

                <tr>
                    <td><strong>Native Name: </strong>{data.nativeName}</td>
                    <td><strong>Top Level Domain: </strong>{data.topLevelDomain}</td>
                </tr>
                <br />
                <tr>
                    <td><strong>Population: </strong>{parseInt(data.population).toLocaleString('pt-BR', { useGrouping: true })}</td>
                    <td><strong>Currencies: </strong>{currencies}</td>
                </tr>
                <br />
                <tr>
                    <td><strong>Region: </strong>{data.region}</td>
                    <td><strong>Languages: </strong>{languages + ''}</td>
                </tr>
                <br />
                <tr>
                    <td><strong>Capital: </strong>{data.capital}</td>
                </tr>
                <br />
            </table>
            <footer>
                <strong>Border Countries: </strong>
                {borders}
            </footer>
        </div>
        
)


    return (
        <>
            <div style={{padding:"9vw 10vw"}}>
                <div>{backButton}</div>
                <br />
                <div style={{ display: 'flex', justifyContent: 'space-between',flexFlow:'wrap' }}>
                    <img width='600vw' src={flag} alt='flag' />
                    <br />
                    {infos}
                </div>
            </div>
        </>
    )
}