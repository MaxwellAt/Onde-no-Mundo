import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { NavLink } from "react-router-dom";
import { useCountries } from "../hooks/useCountries";
import { findCountryByName } from "../services/countriesIngestion";

export default function Details({valIsDarkMode}) {

    const { Name } = useParams();
    const decodedName = (() => {
        try {
            return decodeURIComponent(Name || "");
        } catch {
            return Name || "";
        }
    })();

    const { countries, loading, error } = useCountries();
    
    const [data, setData] = useState(null);
    const [ languages, setLang ] = useState([]);
    const [flag, setFlag] = useState("");
    const [currencies, setCurrencies] = useState("")
    const [borders, setBorders] = useState([])

    useEffect(() => {
        if (loading || error) return;
        const country = findCountryByName(countries, decodedName);
        setData(country);
        setLang(country?.languages || []);
        setFlag(country?.flags?.svg || country?.flags?.png || "");
        setCurrencies(country?.currenciesCode || "");
        setBorders(country?.borders || []);
    }, [countries, decodedName, loading, error]);

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
            <h1><strong>{decodedName}</strong></h1>
            <table >

                <tr>
                    <td><strong>Native Name: </strong>{data?.nativeName || "-"}</td>
                    <td><strong>Top Level Domain: </strong>{(data?.topLevelDomain || []).join(", ") || "-"}</td>
                </tr>
                <br />
                <tr>
                    <td><strong>Population: </strong>{(data?.population || 0).toLocaleString('pt-BR', { useGrouping: true })}</td>
                    <td><strong>Currencies: </strong>{currencies || "-"}</td>
                </tr>
                <br />
                <tr>
                    <td><strong>Region: </strong>{data?.region || "-"}</td>
                    <td><strong>Languages: </strong>{languages.length ? languages.join(", ") : "-"}</td>
                </tr>
                <br />
                <tr>
                    <td><strong>Capital: </strong>{data?.capital || "-"}</td>
                </tr>
                <br />
            </table>
            <footer>
                <strong>Border Countries: </strong>
                {borders.length
                    ? borders.map((code) => (
                        <div className={`btn btn-${valIsDarkMode ? "dark" : "light"} m-1`} key={code}>
                            {code}
                        </div>
                    ))
                    : "-"}
            </footer>
        </div>
        
)


    return (
        <>
            <div style={{padding:"9vw 10vw"}}>
                <div>{backButton}</div>
                <br />
                {loading ? (
                    <div className={`text-${valIsDarkMode ? "white" : "black"}`}>
                        Carregando detalhes…
                    </div>
                ) : error ? (
                    <div className={`text-${valIsDarkMode ? "white" : "black"}`}>
                        Não foi possível carregar os detalhes.
                    </div>
                ) : !data ? (
                    <div className={`text-${valIsDarkMode ? "white" : "black"}`}>
                        País não encontrado.
                    </div>
                ) : (
                    <div style={{ display: 'flex', justifyContent: 'space-between',flexFlow:'wrap' }}>
                        <img width='600vw' src={flag} alt='flag' />
                        <br />
                        {infos}
                    </div>
                )}
            </div>
        </>
    )
}