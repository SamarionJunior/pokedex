import { useEffect, useRef, useState } from 'react';
import './App.css';

import axios from "axios";

const baseURL = "https://pokeapi.co/api/v2/pokemon?limit=151&offset=0";

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

const assignment = (value, another) => {
    if(isEmpty(value)){
        return value
    } else {
        return another
    }
}

const Simplified = () => {

    const [pokemons, setPokemons] = useState()

    const [loading, setLoading] = useState(false)

    const getlistOfPokemonNamesAndURLs = async () => {
        return await axios
            .get(baseURL)
            .then(response => response.data.results)
    }

    const getPokemonsByUrl = async (results) => {
        return await Promise.all(
            results.map(
                async result => (
                    await axios
                        .get(result.url)
                        .then(response => response.data)
                )
            )
        )
    }

    // const sortPokemon = (pokemons) => {
    //     return pokemons
    //         .sort(comparator("id"))
    // }

    // const objectPokemon = (pokemons) => {
    //     if(isEmpty(pokemons)){
    //         pokemons.unshift({})
    //         return pokemons
    //             .reduce((objectPokemons, pokemon) => {
    //                 return ({...objectPokemons, [pokemon.name]: pokemon})
    //             })
    //     }
    // }

    const arrayPokemon = (pokemons) => {
        if(isEmpty(pokemons)){
            return Object.keys(pokemons)?.map(key => pokemons[key])
        }
        return []
    }

    const filterPokemon = (pokemons) => {
        if(isEmpty(pokemons) && isEmpty(pokemonNameSearch)){
            const filterPokemons = pokemons?.filter(pokemon => {
                if(pokemon.name.includes(pokemonNameSearch)){
                    return ({[pokemon.name]: pokemons})
                }
                return false
            })
            return filterPokemons
        }
        return pokemons
    }

    const init = async () => {

        const results = await getlistOfPokemonNamesAndURLs()

        const pokemonsForBackend = await getPokemonsByUrl(results)

        setLoading(true)

        // const sortPokemons = sortPokemon(pokemonsForBackend)

        // const objectPokemons = objectPokemon(pokemonsForBackend)

        setPokemons(pokemonsForBackend)
    }

    const ref = useRef({
        filter: null,
        pokemons: null
    })

    useEffect(() => {
        init()
    }, [])

    const [list, setList] = useState([])

    useEffect(() => {
        if(ref.current["pokemons"] !== null){

            setList(pokemons)

        }
        ref.current["pokemons"] = true
    }, [pokemons])

    const [pokemonNameSearch, setPokemonNameSearch] = useState("")

    // useEffect(() => {
    //     if(ref.current["filter"] !== null){

    //         const newPokemons = new Object(pokemons)
            
    //         const arrayPokemons = arrayPokemon(newPokemons)

    //         const filterPokemons = filterPokemon(arrayPokemons)

    //         const objectPokemons = objectPokemon(filterPokemons)
    
    //         setList(objectPokemons)
    //     }
    //     ref.current["filter"] = true
    // }, [pokemonNameSearch])


    const inputTextSearchPokemon = (event) => {
        event.preventDefault()
        const pokemonNameForSearch = String(event.target.value)
        setPokemonNameSearch(pokemonNameForSearch)
    }

    const onKeyPressPreventDefault = event => {
        if (event.key === "Enter") {
            event.preventDefault();
        }
    }

    useEffect(() => {
        console.log(loading)
    }, [loading])

    return (
        <>

            {/* <div className="row">
                <div className="col-12">
                    <nav className="navbar navbar-expand-lg py-4">
                        <div className="container-fluid gx-0">
                            {loading ? 

                                <form className="d-flex w-100" role="search">
                                    <input 
                                        onChange={inputTextSearchPokemon}
                                        onKeyPress={onKeyPressPreventDefault}
                                        className="form-control shadow-sm"
                                        type="text"
                                        placeholder="Pesquise por um pokemon!"
                                        aria-label="Pesquise por um pokemon!"
                                    />
                                </form>

                            :
                                                
                                <p className="bg-white placeholder-glow m-0 w-100 rounded">
                                    <span 
                                        className="placeholder rounded"
                                        style={{width: "100%", height: "38px", margin: "0px"}}
                                    />
                                </p>

                            }

                            

                        </div>
                    </nav>
                </div>
            </div> */}

            <div className="row mb-5 mt-5">
                <div className="col-12">
                    <div className='row gx-4 gy-4'>

                        {loading ? 
                            isEmpty(list) ? 
                                list.map((pokemon, index) => (
                                    <div className='col-12 col-sm-6 col-md-4 col-lg-3' key={index}>
                                        <div className="card shadow-sm text-bg-light border-0">
                                            <div className="row g-0">
                                                <div className="col-4 d-flex align-items-center">
                                                    <img src={pokemon?.sprites?.front_default} alt={pokemon?.sprites?.front_default} className="img-fluid rounded-start"/>
                                                </div>
                                                <div className="col-8">
                                                    <div className="card-body">
                                                        <h5 className="card-title">
                                                            {pokemon?.name?.charAt(0).toUpperCase() + pokemon?.name?.slice(1)}
                                                        </h5>
                                                        <div className='d-flex justify-content-start'>
                                                            {pokemon?.types?.map((type, index) => (
                                                                <span  key={index} className="badge rounded-pill text-bg-secondary me-1">
                                                                    {type.type.name}
                                                                </span >
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )) : null
                            :
                            Array(100).fill(0).map((_, index) => (

                                <div className='col-12 col-sm-6 col-md-4 col-lg-3' key={index}>

                                    <div className="card shadow-sm text-bg-light border-0">
                                        <div className="row g-0">
                                            <div className="col-4 d-flex align-items-center">
                                                
                                                <p className="placeholder-glow m-0">
                                                    <span 
                                                        className="placeholder rounded-start"
                                                        style={{width: "87px", height: "87px", margin: "0px"}}
                                                    />
                                                </p>

                                            </div>
                                            <div className="col-8">
                                                <div className="card-body h-100 d-flex flex-column justify-content-between">
                                                    <h5 className="card-title m-0">

                                                        <p className="placeholder-glow m-0">
                                                            <span 
                                                                className="placeholder rounded"
                                                                style={{width: "100%", height: "10px", margin: "0px"}}
                                                            />
                                                        </p>

                                                    </h5>
                                                    <div className='d-flex justify-content-start w-100'>

                                                        <p className="placeholder-glow w-100 m-0">

                                                            <span 
                                                                className="placeholder rounded"
                                                                style={{width: "45%", height: "10px", marginRight: "10%"}}
                                                            />

                                                            <span 
                                                                className="placeholder rounded"
                                                                style={{width: "45%", height: "10px", margin: "0px"}}
                                                            />

                                                        </p>

                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                </div>

                            ))
                    
                        }

                    </div>
                </div>
            </div>

        </>
    );

}

export default Simplified;
