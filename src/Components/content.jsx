import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem, Card, CardImg, CardBody, CardTitle, CardText } from "reactstrap";
import { NavLink } from "react-router-dom";

export default function Content({valIsDarkMode}) {
  const [data1, setData1] = useState([]);
  const [data, setData] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [title, setTitle] = useState("Filter By Region");
  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);
  
  useEffect(() => {
    fetch("data.json")
      .then(resp => resp.json())
      .then(resp => { setData(resp); setData1(resp) })
  }, []);
  
  const handleSearchInputChange = (event, param1) => {
    if (event.target.value || event.target.textContent) {
      setData(data1)
      let b = event.target.value ? event.target.value[0].toUpperCase() + event.target.value.substring(1) : event.target.textContent
      let nwArray = data.filter((a) => param1 ? a.region.includes(b) : a.name.includes(b))
      nwArray.length !== 0 ? setData(nwArray) : console.log('nothing')
    } else {
      setData(data1)
    }
  };


  const caixadeInput = (
    <div className="field has-addons">
      <div className="control has-icons-left flex-grow">
        <input
          className={`input ${valIsDarkMode ? "dark" : ""}`}
          onChange={handleSearchInputChange}
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
            setData(data1)
            setTitle("Filter By Region")
          }}>Filter By Region</DropdownItem>
        <DropdownItem
          onClick={(event) => {
            handleSearchInputChange(event, true)
            setTitle("Africa")
          }}>Africa</DropdownItem>
        <DropdownItem
          onClick={(event) => {
            handleSearchInputChange(event, true)
            setTitle("Americas")
          }}>Americas</DropdownItem>
        <DropdownItem
          onClick={(event) => {
            handleSearchInputChange(event, true)
            setTitle("Asia")
          }}>Asia</DropdownItem>
        <DropdownItem
          onClick={(event) => {
            handleSearchInputChange(event, true)
            setTitle("Europe")
          }}>Europe</DropdownItem>
        <DropdownItem
          onClick={(event) => {
            handleSearchInputChange(event, true)
            setTitle("Oceania")
          }}>Oceania</DropdownItem>
      </DropdownMenu>
    </Dropdown>

  )

  const Conteudo = (
    <div className="row">
      {data.map((item, index) => (
        <div className="col-md-3 mb-3" key={index}>
          <Card color={valIsDarkMode?"dark":"light"} >
            <CardImg src={item.flags.png} alt={item.name} />
            <CardBody>
              <CardTitle>
                <h1 className="is-white is-medium">
                  <NavLink className={`link-${valIsDarkMode?"secondary":"primary"}`} to={`/${item.name}/`}>{item.name}</NavLink>
                </h1>
              </CardTitle>
              <CardText>
                <strong>Population: </strong>{item.population}
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
      {Conteudo}
    </section>
  </>
  )
};