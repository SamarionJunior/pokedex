import { Fragment, useEffect, useRef, useState } from 'react';
import './App.css';

// import React, { Fragment, useEffect, useState } from 'react';
import axios from "axios";

const baseURL = "https://pokeapi.co/api/v2/pokemon?limit=10&offset=0";

const typesURL = "https://pokeapi.co/api/v2/type";

const isEmpty = value => {
    if(typeof value === 'undefined' || value ==="" || value == null || value === null || value === undefined || value === undefined){
        return false
    }
    if(typeof value === 'object'){
        if(Object.keys(value).length === 0){
            return false
        }
        return true
    }
    if(Array.isArray(value)){
        if(value.length === 0){
            return false
        }
        return true
    }
    return true
}

const comparator = (prop) => (itemA, itemB) => {

    if(itemA[prop] > itemB[prop]) return 1

    if(itemA[prop] < itemB[prop]) return -1

    return 0;

}

const searchLocation = async (url) => 
    await axios
        .get(url)
        .then((response) => {
            const localizacoes = response.data
            if(isEmpty(localizacoes)){
                return localizacoes.map(location => 
                    location.location_area.name
                )
            }
        })

const vasculhar = (object, array) => {
    const nameSpecies = object.species.name
    array.push(nameSpecies)
    if("evolves_to" in object){
        const evolvesToChain = object.evolves_to
        if(isEmpty(evolvesToChain)){
            evolvesToChain.map((evolvesTo) => 
                vasculhar(evolvesTo, array)
            )
        }
    }
}

// const searchEvolutionChain = async (url) => await axios
//     .get(url)
//     .then((response) => {
//         const evolutionChain = response.data.chain
//         const array = []
//         vasculhar(evolutionChain, array)
//         return array
//     })

// const searchEvolution = async (url) => await axios
//     .get(url)
//     .then(async (response) => {
//         const evolutionChainUrl = response.data.evolution_chain.url
//         return await searchEvolutionChain(evolutionChainUrl)
//     })

const assignment = (value, another) => {
    if(isEmpty(value)){
        return value
    } else {
        return another
    }
}

const Simplified = () => {

    const [types, setTypes] = useState();

    const getTypes = async () => {
        return await axios
            .get(typesURL)
            .then(response => {
                    response.data.results.map(result => result["checked"] = false)
                    return response.data.results
                }
            )
    }

    const sortType = (types) => {
        return types
            .sort(comparator("name"))
    }

    const objectType = (types) => {
        if(isEmpty(types)){
            types.unshift({})
            return types
                .reduce((objectTypes, type) => {
                    return ({
                        ...objectTypes, 
                        [type.name]: type
                    })
                })
        }
    }

    const arrayType = (types) => {
        if(isEmpty(types)){
            return Object.keys(types)?.map(key => pokemons[key])
        }
        return []
    }

    const [pokemonNameSearch, setPokemonNameSearch] = useState("")
    
    const searchPokemon = async (response) => {

        const pokemon = response.data
    
        const urlDosLocalizacoes = pokemon.location_area_encounters
            
        const location = await searchLocation(urlDosLocalizacoes)
    
        pokemon.location = assignment(location, [])
    
        // /// EVOLUTION
    
        // const urlSpecies = pokemon.species.url
    
        // const evolution = await searchEvolution(urlSpecies)
    
        // pokemon.evolution = assignment(evolution, [])
    
        return pokemon
    }

    const getlistOfPokemonNamesAndURLs = async () => {
        return await axios
            .get(baseURL)
            .then(response => response.data.results)
    }

    const getPokemonsByUrl = async (results) => {
        return await Promise.all(results.map(async result => (
            await axios
                .get(result.url)
                .then(searchPokemon)
        ))).then(urls => urls)
    }

    const sortPokemon = (pokemons) => {
        return pokemons
            .sort(comparator("id"))
    }

    const objectPokemon = (pokemons) => {
        if(isEmpty(pokemons)){
            pokemons.unshift({})
            return pokemons
                .reduce((objectPokemons, pokemon) => {
                    return ({...objectPokemons, [pokemon.name]: pokemon})
                })
        }
    }

    const arrayPokemon = (pokemons) => {
        if(isEmpty(pokemons)){
            return Object.keys(pokemons)?.map(key => pokemons[key])
        }
        return []
    }

    const filterPokemon = (pokemons) => {
        // console.log(pokemonNameSearch, isEmpty(pokemonNameSearch))
        if(isEmpty(pokemons) && isEmpty(pokemonNameSearch)){
            const filterPokemons = pokemons?.filter(pokemon => {
                if(pokemon.name.includes(pokemonNameSearch)){
                    return ({[pokemon.name]: pokemons})
                }
                return false
            })
            // console.log(filterPokemons)
            return filterPokemons
        }
        return pokemons
    }

    const [pokemonSelected, setPokemonSelected] = useState()

    const init = async () => {

        const results = await getlistOfPokemonNamesAndURLs()

        const pokemonsForBackend = await getPokemonsByUrl(results)

        const sortPokemons = sortPokemon(pokemonsForBackend)

        const objectPokemons = objectPokemon(sortPokemons)

        setPokemons(objectPokemons)
        
        const types = await getTypes()

        const sortTypes = sortType(types)

        const objectTypes = objectType(sortTypes);

        setTypes(objectTypes)
    }

    const [pokemons, setPokemons] = useState()
    const [list, setList] = useState()

    const ref = useRef({
        filter: null,
        pokemons: null,
        types: null
    })

    useEffect(() => {
        init()
    }, [])

    useEffect(() => {
        if(ref.current["pokemons"] !== null){

            setList(pokemons)

        }
        ref.current["pokemons"] = true
    }, [pokemons])

    useEffect(() => {
        if(ref.current["types"] !== null){

            if(isEmpty(pokemons) && isEmpty(types)){
                console.clear()
                // console.log(types)
                // console.log("///////////////////////")
                getPokemonsByType()

                // console.log(checkedState)
            }

        }
        ref.current["types"] = true
    }, [types])

    useEffect(() => {
        if(ref.current["filter"] !== null){

            const newPokemons = new Object(pokemons)
            
            const arrayPokemons = arrayPokemon(newPokemons)
            // console.log(arrayPokemons)

            const filterPokemons = filterPokemon(arrayPokemons)
            // console.log(filterPokemons)

            const objectPokemons = objectPokemon(filterPokemons)
            // console.log(objectPokemons)
    
            setList(objectPokemons)
        }
        ref.current["filter"] = true
    }, [pokemonNameSearch])


    const inputTextSearchPokemon = (event) => {
        event.preventDefault()
        const pokemonNameForSearch = String(event.target.value)
        setPokemonNameSearch(pokemonNameForSearch)
    }

    const handleOnChange = (name) => {
        const updatedCheckedState = Object.keys(types).map((key, index) => {
            if(types[key].name === name){
                types[key].checked = !types[key].checked
            }
            return types[key]
        });

        // console.log("oi")

        const newTypes = objectType(updatedCheckedState)

        setTypes(newTypes);
    };

    const [listSearch, setListSearch]= useState([])

    const getPokemonsByType = () => {
        // const arrayTypes = arrayType(types)
        const arrayPokemons = arrayPokemon(pokemons)

        const pokemonsSameTypes = arrayPokemons.filter((pokemon, index) => {
            const arrayBoolean = pokemon.types.map(type => 
                types[type.type.name].checked
            )
            
            const arrayReducer = arrayBoolean?.reduce((accumulator, currentValue) => accumulator || currentValue, false)

            return arrayReducer
        })

        const sortPokemons = sortPokemon(pokemonsSameTypes)

        const objectTypes = objectType(sortPokemons)
        // const pokemonsSameTypes = pokemons
        console.log(objectTypes)

        if(isEmpty(objectTypes)){
            setList(objectTypes)
        }
        
        // if(isEmpty(objectTypes)){
        //     Object.keys(objectTypes)?.map((t, index) => console.log(t))
        // }

        // isEmpty(objectTypes) ? Object.keys(objectTypes)?.map((t, index) => console.log(t)) : null
    }

    return (
        <>

            <div className="row">
                <div className="col-12">
                    <nav className="navbar navbar-expand-lg py-4">
                        <div className="container-fluid gx-0">
                            <form className="d-flex w-100" role="search">
                                <button className="btn btn-outline-light me-2 shadow-sm" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasNavbar" aria-controls="offcanvasNavbar" aria-label="Toggle navigation">
                                    <i className="fa-solid fa-filter"/>
                                </button>
                                <input 
                                    onChange={inputTextSearchPokemon}
                                    onKeyPress={(event) => {
                                        if (event.key === "Enter") {
                                            event.preventDefault();
                                        }
                                    }}
                                    className="form-control shadow-sm"
                                    type="text"
                                    placeholder="Search"
                                    aria-label="Search"
                                />
                            </form>
                            <div className="offcanvas offcanvas-end" tabIndex="-1" id="offcanvasNavbar" aria-labelledby="offcanvasNavbarLabel">
                                <div className="offcanvas-header text-light bg-danger">
                                    <h5 className="offcanvas-title" id="offcanvasNavbarLabel">
                                        Offcanvas
                                    </h5>
                                    <button type="button" className="btn-close" style={{filter: "invert(100%)"}} data-bs-dismiss="offcanvas" aria-label="Close">
                                        
                                    </button>
                                </div>
                                <div className="offcanvas-body navbar-danger bg-danger">
                                    {isEmpty(types) ? Object.keys(types)?.map((key, index) => (
                                        <Fragment key={index}>
                                            <input 
                                                type="checkbox" 
                                                className="btn-check" 
                                                id={`btn-check-outlined-${types[key].name}`} 
                                                autoComplete="off"
                                                checked={types[key].checked}
                                                onChange={() => handleOnChange(types[key].name)}
                                            />
                                            <label className="btn btn-outline-light m-1" htmlFor={`btn-check-outlined-${types[key].name}`}>{types[key].name}</label>
                                        </Fragment>
                                    )) : null}
                                </div>
                            </div>
                        </div>
                    </nav>
                </div>
            </div>

            <div className="row mb-5">
                <div className="col-12">
                    <div className='row gx-4 gy-4'>
                        {isEmpty(list) ? 
                            Object.keys(list).map((key, index) => (
                                <div className='col-12 col-sm-6 col-md-4 col-lg-3' key={index}>
                                    {/* {console.log(list)} */}
                                    <div className="card shadow-sm text-bg-light border-0">
                                        <div className="row g-0">
                                            <div className="col-4 d-flex align-items-center">
                                                <img src={list[key]?.sprites?.front_default} alt={list[key]?.sprites?.front_default} className="img-fluid rounded-start"/>
                                            </div>
                                            <div className="col-8">
                                                <div className="card-body">
                                                    <h5 className="card-title">
                                                        {list[key]?.name?.charAt(0).toUpperCase() + list[key]?.name?.slice(1)}
                                                    </h5>
                                                    <div className='d-flex justify-content-start mb-2'>
                                                        {list[key]?.types?.map((type, index) => (
                                                            <span  key={index} className="badge rounded-pill text-bg-secondary me-1">{type.type.name}</span >
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )) : null
                        }
                    </div>
                </div>
            </div>

            

            

            {/* <div className="row mb-5">
                <div className="col-12">
                    <div className='row gx-4 gy-4'>
                        <nav aria-label="Page navigation example">
                            <ul class="pagination">
                                <li class="page-item"><a class="page-link" href="#">Previous</a></li>
                                <li class="page-item"><a class="page-link" href="#">1</a></li>
                                <li class="page-item"><a class="page-link" href="#">2</a></li>
                                <li class="page-item"><a class="page-link" href="#">3</a></li>
                                <li class="page-item"><a class="page-link" href="#">Next</a></li>
                            </ul>
                        </nav>
                    </div>
                </div>
            </div> */}

        </>
    );

}

export default Simplified;

// const [checkedState, setCheckedState] = useState();

// const initChecked = () => setCheckedState(
//     new Array(Object.keys(types)?.length).fill(false)
// )

// useEffect(() => {
//     if(ref.current["types"] !== null){

//         // if(isEmpty(pokemons)){
//         //     // getPokemonsByType()

//         //     console.log(checkedState)
//         // }

//         // console.log(checkedState)
//         // initChecked()

//     }
//     ref.current["types"] = true

// }, [types])

// const converte

// const [total, setTotal] = useState(0);

// const handleOnChange = (position) => {
//     const updatedCheckedState = checkedState.map((item, index) =>
//         index === position ? !item : item
//     );

    // setCheckedState(updatedCheckedState);

    // const totalPrice = updatedCheckedState.reduce(
    //     (sum, currentState, index) => {
    //         if (currentState === true) {
    //             return sum + toppings[index].price;
    //         }
    //         return sum;
    //     },
    //     0
    // );

    // setTotal(totalPrice);
// };

// return (
//     <input
//         type="checkbox"
//         id={`custom-checkbox-${index}`}
//         checked={checkedState[index]}
//         onChange={() => handleOnChange(index)}
//     />
// )

// {/* <button className="btn btn-outline-light shadow-sm" type="button">
//     <i className="fa-solid fa-magnifying-glass"/>
// </button> */}

// {/* <i className="fa-solid fa-xmark"></i> */}

// {/* <button className="navbar-toggler" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasNavbar" aria-controls="offcanvasNavbar" aria-label="Toggle navigation">
//     <span className="navbar-toggler-icon"></span>
// </button> */}

// {/* <nav className="navbar">
//     <div className="container-fluid">
//         <button className="navbar-toggler" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasNavbar" aria-controls="offcanvasNavbar" aria-label="Toggle navigation">
//             <span className="navbar-toggler-icon"></span>
//         </button>
//         <div className="offcanvas offcanvas-end" tabindex="-1" id="offcanvasNavbar" aria-labelledby="offcanvasNavbarLabel">
//             <div className="offcanvas-header text-light bg-dark">
//                 <h5 className="offcanvas-title" id="offcanvasNavbarLabel">
//                     Offcanvas
//                 </h5>
//                 <button type="button" className="btn-close" style={{filter: "invert(100%)"}} data-bs-dismiss="offcanvas" aria-label="Close">
//                     <i className="fa-solid fa-xmark"></i>
//                 </button>
//             </div>
//             <div className="offcanvas-body navbar-dark bg-dark">
//                 <ul className="navbar-nav justify-content-end flex-grow-1 pe-3">
//                     <li className="nav-item">
//                         <a className="nav-link active" aria-current="page" href="#">Home</a>
//                     </li>
//                     <li className="nav-item">
//                         <a className="nav-link" href="#">Link</a>
//                     </li>
//                 </ul>
//             </div>
//         </div>
//     </div>
// </nav> */}

// React.useEffect(() => {
//     axios.get("https://pokeapi.co/api/v2/type").then(async (response) => 
//         await Promise.all(response.data.results.map(async result => {
//             const dl = await axios.get(result.url).then((response) => {
//                 return response.data.damage_relations
//             })
//             setTypes(oldTypes => ({
//                 ...oldTypes,
//                 [result.name]: dl
//             }))    
//         }))
//     )
//   }, []);

// const getPokemonSameType = (types) => {
//     return Object.keys(pokemons).filter((key, index) => {
//         const typesPokemons = pokemons[key].types.map(type => type.type.name)
//         for(const typePokemons of typesPokemons){
//             if(types.includes(typePokemons)){
//                 return true
//             }
//         }
//         return false
//     })
// }

// const creatSubArray = (array, length) => {
//     const novoArray = []

//     for (var i = 0; i < array.length; i = i + length) {
//         novoArray.push(array.slice(i, i + length));
//     }

//     return novoArray;
// }