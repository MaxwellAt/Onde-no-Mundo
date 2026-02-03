import React, { useMemo, useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem, Card, CardImg, CardBody, CardTitle, CardText } from "reactstrap";
import { NavLink } from "react-router-dom";
import { useCountries } from "../hooks/useCountries";

export default function Content({valIsDarkMode}) {
  const { countries, loading, error } = useCountries();
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [title, setTitle] = useState("Filter By Region");
  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return countries.filter((c) => {
      const matchRegion = region ? c.region === region : true;
      const matchQuery = q ? c.name.toLowerCase().includes(q) : true;
      return matchRegion && matchQuery;
    });
  }, [countries, query, region]);


  const caixadeInput = (
    <div className="field has-addons">
      <div className="control has-icons-left flex-grow">
        <input
          className={`input ${valIsDarkMode ? "dark" : ""}`}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          type="text"
          placeholder="Search for a country..."
        />
        <span className="icon is-small is-left">
          <FontAwesomeIcon icon={faSearch} />
        </span>
      </div>
    </div>
  )

  const dropDown = (
    <Dropdown isOpen={dropdownOpen} toggle={toggleDropdown} className={`ml-auto p-2`}>
      <DropdownToggle
        color={valIsDarkMode ? "dark" : "light"}
        caret>{title}</DropdownToggle>
      <DropdownMenu dark={valIsDarkMode}>
        <DropdownItem
          onClick={() => {
            setRegion("");
            setTitle("Filter By Region")
          }}>Filter By Region</DropdownItem>
        <DropdownItem
          onClick={() => {
            setRegion("Africa");
            setTitle("Africa")
          }}>Africa</DropdownItem>
        <DropdownItem
          onClick={() => {
            setRegion("Americas");
            setTitle("Americas")
          }}>Americas</DropdownItem>
        <DropdownItem
          onClick={() => {
            setRegion("Asia");
            setTitle("Asia")
          }}>Asia</DropdownItem>
        <DropdownItem
          onClick={() => {
            setRegion("Europe");
            setTitle("Europe")
          }}>Europe</DropdownItem>
        <DropdownItem
          onClick={() => {
            setRegion("Oceania");
            setTitle("Oceania")
          }}>Oceania</DropdownItem>
      </DropdownMenu>
    </Dropdown>

  )

  const Conteudo = (
    <div className="row">
      {filtered.map((item, index) => (
        <div className="col-md-3 mb-3" key={item.alpha3Code || item.name || index}>
          <Card color={valIsDarkMode?"dark":"light"} >
            <CardImg src={item.flags.png} alt={item.name} />
            <CardBody>
              <CardTitle>
                <h1 className={`text-${valIsDarkMode ? "white" : "black"} h4`}>
                  <NavLink
                    className={`${valIsDarkMode ? "text-white" : "text-black"}`}
                    to={`/${encodeURIComponent(item.name)}`}
                  >
                    {item.name}
                  </NavLink>
                </h1>
              </CardTitle>
              <CardText>
                <strong>Population: </strong>{(item.population || 0).toLocaleString('pt-BR', { useGrouping: true })}
                <br />
                <strong>Region: </strong>{item.region}
                <br />
                <strong>Capital: </strong>{item.capital}
              </CardText>
            </CardBody>
          </Card>
        </div>
      ))}
    </div>
  );

  return (
    <>
    <br />
    <section style={{ width: "90%", margin: "auto" }}>
      <div className="d-flex mb-2">
        {caixadeInput}
        {dropDown}
      </div>
      {loading ? (
        <div className={`text-${valIsDarkMode ? "white" : "black"}`}>
          Carregando países…
        </div>
      ) : error ? (
        <div className={`text-${valIsDarkMode ? "white" : "black"}`}>
          Não foi possível carregar os países no momento.
        </div>
      ) : (
        Conteudo
      )}
    </section>
  </>
  )
};