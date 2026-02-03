import React,{ useState} from 'react';
import { Navbar, NavbarBrand } from "reactstrap";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMoon, faSun } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';

export default function HdrBar({fun,valIsDarkMode}) {

    const [isDarkMode, setIsDarkMode] = useState(valIsDarkMode);

    const toggleDarkMode = () => {
        setIsDarkMode(!isDarkMode)
        fun(!isDarkMode)
        const root = document.documentElement;
        if (isDarkMode) {
            root.style.setProperty("--body", "hsl(0, 0%, 98%)");
            root.style.setProperty("--color-text", "black");
        } else {
            root.style.setProperty("--body", "hsl(207, 26%, 17%)");
            root.style.setProperty("--color-text", "white");
        }
    };
    return (
        <Navbar color={isDarkMode ? "dark" : "light"} light expand="md">
            <NavbarBrand tag={Link} to="/" color={isDarkMode ? "dark" : "light"}>
                <strong>Where in the world?</strong>
            </NavbarBrand>
            <button onClick={toggleDarkMode} className={`button is-small is-${isDarkMode ? "dark" : "light"}`}>
                <span className="icon">
                    <FontAwesomeIcon icon={isDarkMode ? faSun : faMoon} />
                </span>
                <span>{isDarkMode ? "Light Mode" : "Dark Mode"}</span>
            </button>
        </Navbar>
    )
}
 