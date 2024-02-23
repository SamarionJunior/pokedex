import './App.css';

import React, { Fragment } from 'react';
import axios from "axios";

const baseURL = "https://pokeapi.co/api/v2/pokemon?limit=100&offset=0";

// const countId = {id: -1}

// const geradorDeId = (max = 999999999999, min = 100000000000) => {
//     countId.id++
//     return countId.id++
// }

// const geradorDeIdOld = (max = 999999999999, min = 100000000000) => {
//     return Math.floor(Math.random() * (max - min + 1) + min).toString()
// }

const isEmpty = value => {
    if(typeof value === 'undefined' || value == null || value === null || value === undefined || value === undefined){
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

const searchLocation = async (url) => await axios
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

const searchEvolutionChain = async (url) => await axios
    .get(url)
    .then((response) => {
        const evolutionChain = response.data.chain
        const array = []
        vasculhar(evolutionChain, array)
        return array
    })

const searchEvolution = async (url) => await axios
    .get(url)
    .then(async (response) => {
        const evolutionChainUrl = response.data.evolution_chain.url
        return await searchEvolutionChain(evolutionChainUrl)
    })

const assignment = (value, another) => {
    if(isEmpty(value)){
        return value
    } else {
        return another
    }
}

// const searchWeakness = async urls => await axios
//     .get(urls)
//     .then(async (response) => {
//         const damageRelations = response.data.damage_relations
//         // console.log(damageRelations)
//         const relations = {}
//         for(const keys in damageRelations){
//             relations[keys] = damageRelations[keys].map(type => 
//                 type.name
//             )
//         }

//         return relations
//     }) 

// const mapTypes = async (pokemon) => await Promise.all(
//     pokemon.types.map(async type =>{
//         const urls = type.type.url
//         return searchWeakness(urls)
//     })
// )

// const pasertUseState = (setUseState) => {

//     const searchPokemon = async (response) => {
//         const pokemon = response.data
    
//         /// ID
    
//         // pokemon.id = geradorDeId()
    
//         /// LOCATION
    
//         const urlDosLocalizacoes = pokemon.location_area_encounters
            
//         const location = await searchLocation(urlDosLocalizacoes)
    
//         pokemon.location = assignment(location, [])
    
//         /// EVOLUTION
    
//         const urlSpecies = pokemon.species.url
    
//         const evolution = await searchEvolution(urlSpecies)
    
//         pokemon.evolution = assignment(evolution, [])
    
//         /// WEAKNESS
    
//         // const weakness = await mapTypes(pokemon)
    
//         // pokemon.weakness = assignment(weakness, [])
    
//         setUseState(oldUrls => ({...oldUrls, [pokemon.name]: pokemon}))
//     }

//     return searchPokemon
// }

function Simplified() {
    
    const [posts, setPosts] = React.useState([]);
    
    const [urls, setUrls] = React.useState([]);
    
    const [pokemons, setPokemons] = React.useState({});
    
    const [pokemon, setPokemon] = React.useState({});

    const [types, setTypes] = React.useState({});
    
    const searchPokemon = async (response) => {
        const pokemon = response.data
    
        /// ID
    
        // pokemon.id = geradorDeId()
    
        /// LOCATION
    
        const urlDosLocalizacoes = pokemon.location_area_encounters
            
        const location = await searchLocation(urlDosLocalizacoes)
    
        pokemon.location = assignment(location, [])
    
        /// EVOLUTION
    
        const urlSpecies = pokemon.species.url
    
        const evolution = await searchEvolution(urlSpecies)
    
        pokemon.evolution = assignment(evolution, [])
    
        /// WEAKNESS
    
        // const weakness = await mapTypes(pokemon)
    
        // pokemon.weakness = assignment(weakness, [])
    
        return pokemon
    }

    React.useEffect(() => {
        axios.get("https://pokeapi.co/api/v2/type").then(async (response) => 
            await Promise.all(response.data.results.map(async result => {
                const dl = await axios.get(result.url).then((response) => {
                    return response.data.damage_relations
                })
                setTypes(oldTypes => ({
                    ...oldTypes,
                    [result.name]: dl
                }))    
            }))
        )
      }, []);

    React.useEffect(() => {
        axios.get(baseURL).then((response) => {
            setPosts(response.data.results);
        });
    }, []);

    React.useEffect(() => {
        Promise.all(posts.map(async post => (
            await axios
                .get(post.url)
                .then(searchPokemon)
        ))).then(pokemons => setUrls(pokemons))
    }, [posts]);

    // React.useEffect(() => {
    //     Promise.all(posts.map(async post => (
    //         await axios
    //             .get(post.url)
    //             .then(searchPokemon)
    //     )))
    // }, [posts]);

    React.useEffect(() => {
        const pokemonsOrdered = urls.sort(comparator("id"))
        pokemonsOrdered.map(pokemons => setPokemons(oldPokemons => ({...oldPokemons, [pokemons.name]: pokemons})))
    }, [urls]);

    React.useEffect(() => {
        // setPokemon(pokemons["bulbasaur"])
    }, [pokemons]);

    React.useEffect(() => {
        // console.log(pokemon)
    }, [pokemon]);

    // React.useEffect(() => {
    //     console.log("types", types)
    // }, [types]);

    // console.log(urls)

    const selectPokemon = (pokemon, newPokemon) => {
        const element = document.getElementById("trueRoot");
        if(isEmpty(pokemon)){
            setPokemon({})
            element.classList.remove("bg-primary");
            element.classList.add("bg-danger");
        } else {
            setPokemon(newPokemon)
            element.classList.remove("bg-danger");
            element.classList.add("bg-primary");
        }
    }

    const getPokemonSameType = (types) => {
        return Object.keys(pokemons).filter((key, index) => {
            const typesPokemons = pokemons[key].types.map(type => type.type.name)
            for(const typePokemons of typesPokemons){
                if(types.includes(typePokemons)){
                    return true
                }
            }
            return false
        })
    }

    const creatSubArray = (array, length) => {
        const novoArray = []

        for (var i = 0; i < array.length; i = i + length) {
            novoArray.push(array.slice(i, i + length));
        }

        return novoArray;
    }


  
    return (
        <>
            {isEmpty(pokemon) ? (
                <Fragment key={pokemon.id}>

                    <div className="row mb-3">
                        <div className="col-12">
                            <nav className="navbar navbar-expand-lg py-4">
                                <div className="container-fluid gx-0">
                                    <form className="d-flex w-100 justify-content-between" role="search">
                                        <button className="btn btn-outline-light me-2" type="button" onClick={() => selectPokemon(pokemon, {})}>
                                            <i className="fa-solid fa-arrow-left"/>
                                        </button>
                                        <button className="btn btn-outline-light" type="button" onClick={() => selectPokemon(pokemon, {})}>
                                            <i className="fa-solid fa-xmark"/>
                                        </button>
                                    </form>
                                </div>
                            </nav>
                        </div>
                    </div>

                    <div className="row mb-3">
                        <div className='col-12'>

                            <h1 className="text-center text-light">{pokemon.name}</h1>

                        </div>
                    </div>

                    <div className="row g-4 mb-3">

                        {isEmpty(pokemon.sprites) ? 
                            Object.keys(pokemon.sprites).map((key, index) => 
                                typeof pokemon.sprites[key] === 'string' && isEmpty(pokemon.sprites[key]) ? (

                                    <div className='col-12 col-sm-6 col-md-4 col-lg-3' key={index}>
                                    
                                        <div className="card cardBodyRow">
                                            <div className="row g-0">
                                                <div className="col-auto">
                                                    <img src={pokemon.sprites[key]} alt={pokemon.sprites[key]} />
                                                </div>
                                                <div className="col">
                                                    <div className="card-body cardBodyRow">

                                                        {key.split("_").map((prop, index) => prop === "back" ? (<span className="badge text-bg-primary m-1" key={index}>back</span>) : null)}
                                                        {key.split("_").map((prop, index) => prop === "front" ? (<span className="badge text-bg-primary m-1" key={index}>front</span>) : null)}
                                                        {key.split("_").map((prop, index) => prop === "default" ? (<span className="badge text-bg-primary m-1" key={index}>default</span>) : null)}
                                                        {key.split("_").map((prop, index) => prop === "shiny" ? (<span className="badge text-bg-primary m-1" key={index}>shiny</span>) : null)}
                                                        {key.split("_").map((prop, index) => prop === "female" ? (<span className="badge text-bg-primary m-1" key={index}>female</span>) : null)}

                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        
                                    </div>

                                ) : null
                            )
                        : null}

                    </div>

                    {/* {pokemon.types.map((typePokemon, index) => (
                    
                        <div className="row g-4 mb-3" key={index}>
                            <div className="col-auto">
                                <button className="btn btn-outline-light" type="button" data-bs-target={`#carouselExampleCaptions${typePokemon.type.name}`} data-bs-slide="prev">
                                    <i className="fa-solid fa-arrow-left"/>
                                </button>
                            </div>
                            <div className="col">
                                <h3 className="mb-3 text-center text-light">{typePokemon.type.name} </h3>
                            </div>
                            <div className="col-auto">
                                <button className="btn btn-outline-light" type="button" data-bs-target={`#carouselExampleCaptions${typePokemon.type.name}`} data-bs-slide="next">
                                    <i className="fa-solid fa-arrow-right"/>
                                </button>
                            </div>
                            <div className="col-12">
                                <div id={`carouselExampleCaptions${typePokemon.type.name}`} className="carousel slide">

                                    <div className="carousel-inner">

                                        {creatSubArray(getPokemonSameType(typePokemon.type.name), 4).map((arrayGroup, index) => (

                                            <div className={`carousel-item ${index === 0 ? "active" : ""}`} key={index}>

                                                <div className="row gx-4 gy-4">

                                                    {arrayGroup.map((name, index) => (
                                                
                                                        <div className="col-12 col-sm-6 col-md-4 col-lg-3" key={index}>
                                                            <div className="card">
                                                                <div className="row g-0">
                                                                    <div className="col-auto">
                                                                        <img src={pokemons[name].sprites.front_default} alt={pokemons[name].sprites.front_default} className="img-fluid rounded-start"/>
                                                                    </div>
                                                                    <div className="col">
                                                                        <div className="card-body w-100 cardBodyColumn">
                                                                            <h5 className="card-title w-100">{pokemons[name].name}</h5>
                                                                            <div className='w-100 mb-2'>
                                                                                {pokemons[name].types.map((type, index) => (
                                                                                    <span  key={index} className="badge rounded-pill text-bg-secondary me-1">{type.type.name}</span >
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                    ))}

                                                </div>
                                            </div>
                                            
                                        ))}

                                    </div>
                                </div>
                            </div>
                        </div>

                    ))} */}

                    <div className="row mb-3">
                        <div className='col-12'>

                            <h1 className="text-center text-light">Evolucion Chain</h1>

                        </div>
                    </div>

                    <div className="row g-4 mb-3">
                        <div className='col-12'>

                            <div className='row gx-4 gy-4'>
                                {pokemon.evolution.map((evolution, index) => (
                                                
                                    <div className="col-12 col-sm-6 col-md-4 col-lg-3" key={index}>
                                        <div className={`card ${pokemon.name === evolution ? "text-bg-primary border-light" : null}`}>
                                            <div className="row g-0">
                                                <div className="col-auto">
                                                    <img src={pokemons[evolution].sprites.front_default} alt={pokemons[evolution].sprites.front_default} className="img-fluid rounded-start"/>
                                                </div>
                                                <div className="col">
                                                    <div className="card-body w-100 cardBodyColumn">
                                                        <h5 className="card-title w-100">{pokemons[evolution].name}</h5>
                                                        <div className='w-100 mb-2'>
                                                            {pokemons[evolution].types.map((type, index) => (
                                                                <span  key={index} className="badge rounded-pill text-bg-secondary me-1">{type.type.name}</span >
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                        </div>
                    </div>

                    {/* <div className="row g-4 mb-3">
                        <div className='col-12'>

                            <div>
                                <h1 className='text-center text-light'>
                                    abilities
                                </h1>
                            </div>

                            <div>

                                {pokemon.abilities.map((ability, index) => (
                                    <span  key={index} className="badge rounded-pill text-bg-secondary me-1">
                                        {ability.ability.name}
                                    </span>
                                ))}

                            </div>

                        </div>
                    </div> */}

                    {/* <div className="row g-4 mb-3">

                        <div className='col-12'>

                            <div>
                                <h1 className='text-center text-light'>location</h1>
                            </div>

                            <div>

                                {pokemon.location ? (
                                    pokemon.location.map((area, index) => (
                                        <span  key={index} className="badge rounded-pill text-bg-secondary me-1">
                                            {area}
                                        </span>
                                    ))
                                ) : null}

                            </div>

                        </div>

                    </div> */}

                    <div className="row g-4 mb-3">
                        <div className='col-12 col-sm-6'>

                            <div>
                                <h1 className='text-center text-light'>
                                    Information
                                </h1>
                            </div>

                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>
                                            characteristics
                                        </th>
                                        <th>
                                            details
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>Types: </td>
                                        <td style={{width: "60%"}}>
                                            {pokemon.types.map((type, index) => (
                                                <span  key={index} className="badge rounded-pill text-bg-secondary me-1">{type.type.name}</span >
                                            ))}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>height: </td>
                                        <td style={{width: "60%"}}>
                                            <span>{pokemon.height}</span>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>weight: </td>
                                        <td style={{width: "60%"}}>
                                            <span>{pokemon.weight}</span>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>location: </td>
                                        <td style={{width: "60%"}}>

                                            {pokemon.location ? (
                                                pokemon.location.map((area, index) => (

                                                    <span  key={index} className="badge rounded-pill text-bg-secondary me-1">
                                                        {area}
                                                    </span>

                                                ))
                                            ) : null}

                                        </td>
                                    </tr>
                                    <tr>
                                        <td>abilities: </td>
                                        <td style={{width: "60%"}}>

                                            {pokemon.abilities.map((ability, index) => (
                                                
                                                <span  key={index} className="badge rounded-pill text-bg-secondary me-1">
                                                    {ability.ability.name}
                                                </span>

                                            ))}

                                        </td>
                                    </tr>
                                </tbody>
                            </table>

                        </div>
                        <div className='col-12 col-sm-6'>

                            <div>
                                <h1 className='text-center text-light'>
                                    Status
                                </h1>
                            </div>

                            <div>

                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Stat</th>
                                            <th>Point</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pokemon.stats.map((stat, index) => (
                                            <tr key={index}>
                                                <td>{stat.stat.name}</td>
                                                <td style={{width: "60%"}}>
                                                    <div className="progress" role="progressbar" aria-label="Basic example" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100">
                                                        <div className="progress-bar" style={{width: (stat.base_stat / 2) + "%"}}>
                                                            {stat.base_stat}
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}

                                    </tbody>
                                </table>

                            </div>

                        </div>
                    </div>

                    {/* <div className="row g-4 mb-3">
                        <div className='col-12 col-sm-6'>

                            <div>
                                <h1 className='text-center text-light'>
                                    Status
                                </h1>
                            </div>

                            <div>

                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Stat</th>
                                            <th>Point</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pokemon.stats.map((stat, index) => (
                                            <tr key={index}>
                                                <td>{stat.stat.name}</td>
                                                <td style={{width: "60%"}}>
                                                    <div className="progress" role="progressbar" aria-label="Basic example" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100">
                                                        <div className="progress-bar" style={{width: (stat.base_stat / 2) + "%"}}>
                                                            {stat.base_stat}
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}

                                    </tbody>
                                </table>

                            </div>

                        </div>
                    </div> */}

                    {/* <div className="row g-4 mb-3">
                        <div className='col-12'>

                            <div>
                                <h1 className='text-center text-light'>move</h1>
                            </div>

                            <div>

                                {pokemon.moves.map((move, index) => (
                                    <span  key={index} className="badge rounded-pill text-bg-secondary me-1">
                                        {move.move.name}
                                    </span>
                                ))}

                            </div>

                        </div>
                    </div> */}

                    <div className="row g-4 mb-3">

                        {pokemon.types.map((urlsType, index) => isEmpty(urlsType) ? (

                            <div key={index} className='col-12 col-sm-6'>
                                    <h3 className="mb-3 text-center text-light">
                                        {urlsType.type.name}
                                    </h3>

                                    <table className="table">
                                        <thead>
                                            <tr>
                                                <th>Vantegem e Desvantagens</th>
                                                <th>Tipos</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            
                                            {Object.keys(types[urlsType.type.name]).map((key, indexx) => isEmpty(key) ? (
                                            
                                                <tr key={indexx}>
                                                    <td>{key.replace(/_/g, " ")}</td> 
                                                    
                                                    <td style={{width: "60%"}}>

                                                        {types[urlsType.type.name][key].map((weak, indexxx) => isEmpty(weak) ? (
                                                            
                                                            <span  key={indexxx} className="badge rounded-pill text-bg-secondary me-1">
                                                                {weak.name}
                                                            </span >

                                                        ) : null)}

                                                    </td>

                                                </tr>

                                            ) : null)}
                                        </tbody>
                                    </table>

                            </div>

                        ) : null)}
                    </div>

                </Fragment>
            ) : null}





            <div className="row">
                <div className="col-12">
                    {!isEmpty(pokemon) ? (
                        <nav className="navbar navbar-expand-lg py-4">
                            <div className="container-fluid gx-0">
                                <form className="d-flex w-100" role="search">
                                    <button className="btn btn-outline-light me-2" type="button">
                                        <i className="fa-solid fa-filter"/>
                                    </button>
                                    <input className="form-control me-2" type="search" placeholder="Search" aria-label="Search"/>
                                    <button className="btn btn-outline-light" type="button">
                                        <i className="fa-solid fa-magnifying-glass"/>
                                    </button>
                                </form>
                            </div>
                        </nav>
                    ) : null }
                </div>
            </div>

            <div className="row">
                <div className="col-12">
                    {!isEmpty(pokemon) ? (
                        <div className='row gx-4 gy-4'>
                            {isEmpty(pokemons) ? 
                                Object.keys(pokemons).map((key, index) => (
                                    <div className='col-12 col-sm-6 col-md-4 col-lg-3' key={index} onClick={() => selectPokemon(pokemon, pokemons[key])}>
                                        <div className="card shadow text-bg-light border-0">
                                            <div className="row g-0">
                                                <div className="col-4">
                                                    <img src={pokemons[key].sprites.front_default} alt={pokemons[key].sprites.front_default} className="img-fluid rounded-start"/>
                                                </div>
                                                <div className="col-8">
                                                    <div className="card-body">
                                                        <h5 className="card-title">{pokemons[key].name}</h5>
                                                        <div className='d-flex justify-content-start'>
                                                            {pokemons[key].types.map((type, index) => (
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
                    ) : null}
                </div>
            </div>
        </>
    );

}

export default Simplified;

            


                    
// {/* <div className="row">
//     <div className="col-6">
//         <h3 className="mb-3">Carousel cards title </h3>
//     </div>
//     <div className="col-6 text-right">
//         <button className="" type="button" data-bs-target="#carouselExampleCaptions" data-bs-slide="prev">
//             <span className="carousel-control-prev-icon" aria-hidden="true"></span>
//         </button>
//         <button className="" type="button" data-bs-target="#carouselExampleCaptions" data-bs-slide="next">
//             <span className="carousel-control-next-icon" aria-hidden="true"></span>
//         </button>
//     </div>
//     <div className="col-12">
//         <div id="carouselExampleCaptions" className="carousel slide">
            
//             <div className="carousel-indicators">
//                 <button type="button" data-bs-target="#carouselExampleCaptions" data-bs-slide-to="0" className="active" aria-current="true" aria-label="Slide 1"></button>
//                 <button type="button" data-bs-target="#carouselExampleCaptions" data-bs-slide-to="1" aria-label="Slide 2"></button>
//                 <button type="button" data-bs-target="#carouselExampleCaptions" data-bs-slide-to="2" aria-label="Slide 3"></button>
//             </div>

//             <div className="carousel-inner">
//                 <div className="carousel-item active">

//                     <div className="row">

//                         <div className="col-md-4 mb-3">
//                             <div className="card">
//                                 <img className="img-fluid" alt="100%x280" src="
                                
//                                 https://images.unsplash.com/photo-1532781914607-2031eca2f00d?ixlib=rb-0.3.5&amp;q=80&amp;fm=jpg&amp;crop=entropy&amp;cs=tinysrgb&amp;w=1080&amp;fit=max&amp;ixid=eyJhcHBfaWQiOjMyMDc0fQ&amp;s=7c625ea379640da3ef2e24f20df7ce8d
                                
//                                 "/>
                                
//                                 <div className="card-body">
//                                     <h4 className="card-title">Special title treatment</h4>
//                                     <p className="card-text">With supporting text below as a natural lead-in to additional content.</p>

//                                 </div>

//                             </div>
//                         </div>

//                         <div className="col-md-4 mb-3">
//                             <div className="card">
//                                 <img className="img-fluid" alt="100%x280" src="https://images.unsplash.com/photo-1532771098148-525cefe10c23?ixlib=rb-0.3.5&amp;q=80&amp;fm=jpg&amp;crop=entropy&amp;cs=tinysrgb&amp;w=1080&amp;fit=max&amp;ixid=eyJhcHBfaWQiOjMyMDc0fQ&amp;s=3f317c1f7a16116dec454fbc267dd8e4"/>
//                                 <div className="card-body">
//                                     <h4 className="card-title">Special title treatment</h4>
//                                     <p className="card-text">With supporting text below as a natural lead-in to additional content.</p>

//                                 </div>

//                             </div>
//                         </div>

//                         <div className="col-md-4 mb-3">
//                             <div className="card">
//                                 <img className="img-fluid" alt="100%x280" src="
                                
//                                 https://images.unsplash.com/photo-1532781914607-2031eca2f00d?ixlib=rb-0.3.5&amp;q=80&amp;fm=jpg&amp;crop=entropy&amp;cs=tinysrgb&amp;w=1080&amp;fit=max&amp;ixid=eyJhcHBfaWQiOjMyMDc0fQ&amp;s=7c625ea379640da3ef2e24f20df7ce8d
                                
//                                 "/>
                                
//                                 <div className="card-body">
//                                     <h4 className="card-title">Special title treatment</h4>
//                                     <p className="card-text">With supporting text below as a natural lead-in to additional content.</p>

//                                 </div>

//                             </div>
//                         </div>

//                     </div>
//                 </div>

//                 <div className="carousel-item">
//                     <div className="row">

//                         <div className="col-md-4 mb-3">
//                             <div className="card">
//                                 <img className="img-fluid" alt="100%x280" src="https://images.unsplash.com/photo-1532771098148-525cefe10c23?ixlib=rb-0.3.5&amp;q=80&amp;fm=jpg&amp;crop=entropy&amp;cs=tinysrgb&amp;w=1080&amp;fit=max&amp;ixid=eyJhcHBfaWQiOjMyMDc0fQ&amp;s=3f317c1f7a16116dec454fbc267dd8e4"/>
//                                 <div className="card-body">
//                                     <h4 className="card-title">Special title treatment</h4>
//                                     <p className="card-text">With supporting text below as a natural lead-in to additional content.</p>

//                                 </div>

//                             </div>
//                         </div>

//                         <div className="col-md-4 mb-3">
//                             <div className="card">
//                                 <img className="img-fluid" alt="100%x280" src="
                                
//                                 https://images.unsplash.com/photo-1532781914607-2031eca2f00d?ixlib=rb-0.3.5&amp;q=80&amp;fm=jpg&amp;crop=entropy&amp;cs=tinysrgb&amp;w=1080&amp;fit=max&amp;ixid=eyJhcHBfaWQiOjMyMDc0fQ&amp;s=7c625ea379640da3ef2e24f20df7ce8d
                                
//                                 "/>
                                
//                                 <div className="card-body">
//                                     <h4 className="card-title">Special title treatment</h4>
//                                     <p className="card-text">With supporting text below as a natural lead-in to additional content.</p>

//                                 </div>

//                             </div>
//                         </div>

//                         <div className="col-md-4 mb-3">
//                             <div className="card">
//                                 <img className="img-fluid" alt="100%x280" src="https://images.unsplash.com/photo-1532771098148-525cefe10c23?ixlib=rb-0.3.5&amp;q=80&amp;fm=jpg&amp;crop=entropy&amp;cs=tinysrgb&amp;w=1080&amp;fit=max&amp;ixid=eyJhcHBfaWQiOjMyMDc0fQ&amp;s=3f317c1f7a16116dec454fbc267dd8e4"/>
//                                 <div className="card-body">
//                                     <h4 className="card-title">Special title treatment</h4>
//                                     <p className="card-text">With supporting text below as a natural lead-in to additional content.</p>

//                                 </div>

//                             </div>
//                         </div>

//                     </div>
//                 </div>

//             </div>
//         </div>
//     </div>
// </div> */}

// {/* <div className="row">
//                         <div className="col-6">
//                             <h3 className="mb-3">Carousel cards title </h3>
//                         </div>
//                         <div className="col-6 text-right">
//                             <button className="" type="button" data-bs-target="#carouselExampleCaptions" data-bs-slide="prev">
//                                 <span className="carousel-control-prev-icon" aria-hidden="true"></span>
//                             </button>
//                             <button className="" type="button" data-bs-target="#carouselExampleCaptions" data-bs-slide="next">
//                                 <span className="carousel-control-next-icon" aria-hidden="true"></span>
//                             </button>
//                         </div>
//                         <div className="col-12">
//                             <div id="carouselExampleCaptions" className="carousel slide">
//                                 <div className="carousel-indicators">
//                                     <button type="button" data-bs-target="#carouselExampleCaptions" data-bs-slide-to="0" className="active" aria-current="true" aria-label="Slide 1"></button>
//                                     <button type="button" data-bs-target="#carouselExampleCaptions" data-bs-slide-to="1" aria-label="Slide 2"></button>
//                                     <button type="button" data-bs-target="#carouselExampleCaptions" data-bs-slide-to="2" aria-label="Slide 3"></button>
//                                 </div>
//                                 <div className="carousel-inner">
//                                     <div className="carousel-item active">
//                                         <div className="row">

//                                                 <div className="col-md-4 mb-3">
//                                                 <div className="card">
//                                                     <img className="img-fluid" alt="100%x280" src="
                                                    
//                                                     https://images.unsplash.com/photo-1532781914607-2031eca2f00d?ixlib=rb-0.3.5&amp;q=80&amp;fm=jpg&amp;crop=entropy&amp;cs=tinysrgb&amp;w=1080&amp;fit=max&amp;ixid=eyJhcHBfaWQiOjMyMDc0fQ&amp;s=7c625ea379640da3ef2e24f20df7ce8d
                                                    
//                                                     "/>
                                                    
//                                                     <div className="card-body">
//                                                         <h4 className="card-title">Special title treatment</h4>
//                                                         <p className="card-text">With supporting text below as a natural lead-in to additional content.</p>

//                                                     </div>

//                                                 </div>
//                                             </div>
//                                             <div className="col-md-4 mb-3">
//                                                 <div className="card">
//                                                     <img className="img-fluid" alt="100%x280" src="
                                                    
//                                                     https://images.unsplash.com/photo-1517760444937-f6397edcbbcd?ixlib=rb-0.3.5&amp;q=80&amp;fm=jpg&amp;crop=entropy&amp;cs=tinysrgb&amp;w=1080&amp;fit=max&amp;ixid=eyJhcHBfaWQiOjMyMDc0fQ&amp;s=42b2d9ae6feb9c4ff98b9133addfb698
                                                    
//                                                     "/>
//                                                     <div className="card-body">
//                                                         <h4 className="card-title">Special title treatment</h4>
//                                                         <p className="card-text">With supporting text below as a natural lead-in to additional content.</p>

//                                                     </div>
//                                                 </div>
//                                             </div>
//                                             <div className="col-md-4 mb-3">
//                                                 <div className="card">
//                                                     <img className="img-fluid" alt="100%x280" src="
                                                    
//                                                     https://images.unsplash.com/photo-1532712938310-34cb3982ef74?ixlib=rb-0.3.5&amp;q=80&amp;fm=jpg&amp;crop=entropy&amp;cs=tinysrgb&amp;w=1080&amp;fit=max&amp;ixid=eyJhcHBfaWQiOjMyMDc0fQ&amp;s=3d2e8a2039c06dd26db977fe6ac6186a
                                                    
//                                                     "/>
//                                                     <div className="card-body">
//                                                         <h4 className="card-title">Special title treatment</h4>
//                                                         <p className="card-text">With supporting text below as a natural lead-in to additional content.</p>

//                                                     </div>
//                                                 </div>
//                                             </div>

//                                         </div>
//                                     </div>
//                                     <div className="carousel-item">
//                                         <div className="row">

//                                             <div className="col-md-4 mb-3">
//                                                 <div className="card">
//                                                     <img className="img-fluid" alt="100%x280" src="https://images.unsplash.com/photo-1532771098148-525cefe10c23?ixlib=rb-0.3.5&amp;q=80&amp;fm=jpg&amp;crop=entropy&amp;cs=tinysrgb&amp;w=1080&amp;fit=max&amp;ixid=eyJhcHBfaWQiOjMyMDc0fQ&amp;s=3f317c1f7a16116dec454fbc267dd8e4"/>
//                                                     <div className="card-body">
//                                                         <h4 className="card-title">Special title treatment</h4>
//                                                         <p className="card-text">With supporting text below as a natural lead-in to additional content.</p>

//                                                     </div>

//                                                 </div>
//                                             </div>
//                                             <div className="col-md-4 mb-3">
//                                                 <div className="card">
//                                                     <img className="img-fluid" alt="100%x280" src="https://images.unsplash.com/photo-1532715088550-62f09305f765?ixlib=rb-0.3.5&amp;q=80&amp;fm=jpg&amp;crop=entropy&amp;cs=tinysrgb&amp;w=1080&amp;fit=max&amp;ixid=eyJhcHBfaWQiOjMyMDc0fQ&amp;s=ebadb044b374504ef8e81bdec4d0e840"/>
//                                                     <div className="card-body">
//                                                         <h4 className="card-title">Special title treatment</h4>
//                                                         <p className="card-text">With supporting text below as a natural lead-in to additional content.</p>

//                                                     </div>
//                                                 </div>
//                                             </div>
//                                             <div className="col-md-4 mb-3">
//                                                 <div className="card">
//                                                     <img className="img-fluid" alt="100%x280" src="https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?ixlib=rb-0.3.5&amp;q=80&amp;fm=jpg&amp;crop=entropy&amp;cs=tinysrgb&amp;w=1080&amp;fit=max&amp;ixid=eyJhcHBfaWQiOjMyMDc0fQ&amp;s=0754ab085804ae8a3b562548e6b4aa2e"/>
//                                                     <div className="card-body">
//                                                         <h4 className="card-title">Special title treatment</h4>
//                                                         <p className="card-text">With supporting text below as a natural lead-in to additional content.</p>

//                                                     </div>
//                                                 </div>
//                                             </div>

//                                         </div>
//                                     </div>
//                                     <div className="carousel-item">
//                                         <div className="row">

//                                             <div className="col-md-4 mb-3">
//                                                 <div className="card">
//                                                     <img className="img-fluid" alt="100%x280" src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-0.3.5&amp;q=80&amp;fm=jpg&amp;crop=entropy&amp;cs=tinysrgb&amp;w=1080&amp;fit=max&amp;ixid=eyJhcHBfaWQiOjMyMDc0fQ&amp;s=ee8417f0ea2a50d53a12665820b54e23"/>
//                                                     <div className="card-body">
//                                                         <h4 className="card-title">Special title treatment</h4>
//                                                         <p className="card-text">With supporting text below as a natural lead-in to additional content.</p>

//                                                     </div>

//                                                 </div>
//                                             </div>
//                                             <div className="col-md-4 mb-3">
//                                                 <div className="card">
//                                                     <img className="img-fluid" alt="100%x280" src="https://images.unsplash.com/photo-1532777946373-b6783242f211?ixlib=rb-0.3.5&amp;q=80&amp;fm=jpg&amp;crop=entropy&amp;cs=tinysrgb&amp;w=1080&amp;fit=max&amp;ixid=eyJhcHBfaWQiOjMyMDc0fQ&amp;s=8ac55cf3a68785643998730839663129"/>
//                                                     <div className="card-body">
//                                                         <h4 className="card-title">Special title treatment</h4>
//                                                         <p className="card-text">With supporting text below as a natural lead-in to additional content.</p>

//                                                     </div>
//                                                 </div>
//                                             </div>
//                                             <div className="col-md-4 mb-3">
//                                                 <div className="card">
//                                                     <img className="img-fluid" alt="100%x280" src="https://images.unsplash.com/photo-1532763303805-529d595877c5?ixlib=rb-0.3.5&amp;q=80&amp;fm=jpg&amp;crop=entropy&amp;cs=tinysrgb&amp;w=1080&amp;fit=max&amp;ixid=eyJhcHBfaWQiOjMyMDc0fQ&amp;s=5ee4fd5d19b40f93eadb21871757eda6"/>
//                                                     <div className="card-body">
//                                                         <h4 className="card-title">Special title treatment</h4>
//                                                         <p className="card-text">With supporting text below as a natural lead-in to additional content.</p>
//                                                     </div>
//                                                 </div>
//                                             </div>
//                                         </div>
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>
//                     </div> */}

                    


//                     {/* <div className="row">
//                         <div className="col">
//                             <div id="carouselExampleCaptions" className="carousel slide">
//                                 <div className="carousel-indicators">
//                                     <button type="button" data-bs-target="#carouselExampleCaptions" data-bs-slide-to="0" className="active" aria-current="true" aria-label="Slide 1"></button>
//                                     <button type="button" data-bs-target="#carouselExampleCaptions" data-bs-slide-to="1" aria-label="Slide 2"></button>
//                                     <button type="button" data-bs-target="#carouselExampleCaptions" data-bs-slide-to="2" aria-label="Slide 3"></button>
//                                 </div>
//                                 <div className="carousel-inner">
//                                     <div className="carousel-item active">
//                                         <img src="https://images.unsplash.com/photo-1532781914607-2031eca2f00d?ixlib=rb-0.3.5&amp;q=80&amp;fm=jpg&amp;crop=entropy&amp;cs=tinysrgb&amp;w=1080&amp;fit=max&amp;ixid=eyJhcHBfaWQiOjMyMDc0fQ&amp;s=7c625ea379640da3ef2e24f20df7ce8d" className="d-block w-100" alt="..."/>
//                                         <div className="carousel-caption d-none d-md-block">
//                                             <h5>First slide label</h5>
//                                             <p>Some representative placeholder content for the first slide.</p>
//                                         </div>
//                                     </div>
//                                     <div className="carousel-item">
//                                         <img src="https://images.unsplash.com/photo-1517760444937-f6397edcbbcd?ixlib=rb-0.3.5&amp;q=80&amp;fm=jpg&amp;crop=entropy&amp;cs=tinysrgb&amp;w=1080&amp;fit=max&amp;ixid=eyJhcHBfaWQiOjMyMDc0fQ&amp;s=42b2d9ae6feb9c4ff98b9133addfb698" className="d-block w-100" alt="..."/>
//                                         <div className="carousel-caption d-none d-md-block">
//                                             <h5>Second slide label</h5>
//                                             <p>Some representative placeholder content for the second slide.</p>
//                                         </div>
//                                     </div>
//                                     <div className="carousel-item">
//                                         <img src="https://images.unsplash.com/photo-1532712938310-34cb3982ef74?ixlib=rb-0.3.5&amp;q=80&amp;fm=jpg&amp;crop=entropy&amp;cs=tinysrgb&amp;w=1080&amp;fit=max&amp;ixid=eyJhcHBfaWQiOjMyMDc0fQ&amp;s=3d2e8a2039c06dd26db977fe6ac6186a" className="d-block w-100" alt="..."/>
//                                         <div className="carousel-caption d-none d-md-block">
//                                             <h5>Third slide label</h5>
//                                             <p>Some representative placeholder content for the third slide.</p>
//                                         </div>
//                                     </div>
//                                 </div>
//                                 <button className="carousel-control-prev" type="button" data-bs-target="#carouselExampleCaptions" data-bs-slide="prev">
//                                     <span className="carousel-control-prev-icon" aria-hidden="true"></span>
//                                     <span className="visually-hidden">Previous</span>
//                                 </button>
//                                 <button className="carousel-control-next" type="button" data-bs-target="#carouselExampleCaptions" data-bs-slide="next">
//                                     <span className="carousel-control-next-icon" aria-hidden="true"></span>
//                                     <span className="visually-hidden">Next</span>
//                                 </button>
//                             </div>
//                         </div>
//                     </div> */}

//                     {/* <div className="row">
//                         <div className="col-6">
//                             <h3 className="mb-3">Carousel cards title </h3>
//                         </div>
//                         <div className="col-6 text-right">
//                             <a className="btn btn-primary mb-3 mr-1" href="#carouselExampleIndicators2" role="button" data-slide="prev">
//                                 <i className="fa fa-arrow-left"></i>
//                             </a>
//                             <a className="btn btn-primary mb-3 " href="#carouselExampleIndicators2" role="button" data-slide="next">
//                                 <i className="fa fa-arrow-right"></i>
//                             </a>
//                         </div>
//                         <div className="col-12">
//                             <div id="carouselExampleIndicators2" className="carousel slide" data-ride="carousel">

//                                 <div className="carousel-inner">
//                                     <div className="carousel-item active">
//                                         <div className="row">

//                                             <div className="col-md-4 mb-3">
//                                                 <div className="card">
//                                                     <img className="img-fluid" alt="100%x280" src="
                                                    
//                                                     https://images.unsplash.com/photo-1532781914607-2031eca2f00d?ixlib=rb-0.3.5&amp;q=80&amp;fm=jpg&amp;crop=entropy&amp;cs=tinysrgb&amp;w=1080&amp;fit=max&amp;ixid=eyJhcHBfaWQiOjMyMDc0fQ&amp;s=7c625ea379640da3ef2e24f20df7ce8d
                                                    
//                                                     "/>
                                                    
//                                                     <div className="card-body">
//                                                         <h4 className="card-title">Special title treatment</h4>
//                                                         <p className="card-text">With supporting text below as a natural lead-in to additional content.</p>

//                                                     </div>

//                                                 </div>
//                                             </div>
//                                             <div className="col-md-4 mb-3">
//                                                 <div className="card">
//                                                     <img className="img-fluid" alt="100%x280" src="
                                                    
//                                                     https://images.unsplash.com/photo-1517760444937-f6397edcbbcd?ixlib=rb-0.3.5&amp;q=80&amp;fm=jpg&amp;crop=entropy&amp;cs=tinysrgb&amp;w=1080&amp;fit=max&amp;ixid=eyJhcHBfaWQiOjMyMDc0fQ&amp;s=42b2d9ae6feb9c4ff98b9133addfb698
                                                    
//                                                     "/>
//                                                     <div className="card-body">
//                                                         <h4 className="card-title">Special title treatment</h4>
//                                                         <p className="card-text">With supporting text below as a natural lead-in to additional content.</p>

//                                                     </div>
//                                                 </div>
//                                             </div>
//                                             <div className="col-md-4 mb-3">
//                                                 <div className="card">
//                                                     <img className="img-fluid" alt="100%x280" src="
                                                    
//                                                     https://images.unsplash.com/photo-1532712938310-34cb3982ef74?ixlib=rb-0.3.5&amp;q=80&amp;fm=jpg&amp;crop=entropy&amp;cs=tinysrgb&amp;w=1080&amp;fit=max&amp;ixid=eyJhcHBfaWQiOjMyMDc0fQ&amp;s=3d2e8a2039c06dd26db977fe6ac6186a
                                                    
//                                                     "/>
//                                                     <div className="card-body">
//                                                         <h4 className="card-title">Special title treatment</h4>
//                                                         <p className="card-text">With supporting text below as a natural lead-in to additional content.</p>

//                                                     </div>
//                                                 </div>
//                                             </div>

//                                         </div>
//                                     </div>
//                                     <div className="carousel-item">
//                                         <div className="row">

//                                             <div className="col-md-4 mb-3">
//                                                 <div className="card">
//                                                     <img className="img-fluid" alt="100%x280" src="https://images.unsplash.com/photo-1532771098148-525cefe10c23?ixlib=rb-0.3.5&amp;q=80&amp;fm=jpg&amp;crop=entropy&amp;cs=tinysrgb&amp;w=1080&amp;fit=max&amp;ixid=eyJhcHBfaWQiOjMyMDc0fQ&amp;s=3f317c1f7a16116dec454fbc267dd8e4"/>
//                                                     <div className="card-body">
//                                                         <h4 className="card-title">Special title treatment</h4>
//                                                         <p className="card-text">With supporting text below as a natural lead-in to additional content.</p>

//                                                     </div>

//                                                 </div>
//                                             </div>
//                                             <div className="col-md-4 mb-3">
//                                                 <div className="card">
//                                                     <img className="img-fluid" alt="100%x280" src="https://images.unsplash.com/photo-1532715088550-62f09305f765?ixlib=rb-0.3.5&amp;q=80&amp;fm=jpg&amp;crop=entropy&amp;cs=tinysrgb&amp;w=1080&amp;fit=max&amp;ixid=eyJhcHBfaWQiOjMyMDc0fQ&amp;s=ebadb044b374504ef8e81bdec4d0e840"/>
//                                                     <div className="card-body">
//                                                         <h4 className="card-title">Special title treatment</h4>
//                                                         <p className="card-text">With supporting text below as a natural lead-in to additional content.</p>

//                                                     </div>
//                                                 </div>
//                                             </div>
//                                             <div className="col-md-4 mb-3">
//                                                 <div className="card">
//                                                     <img className="img-fluid" alt="100%x280" src="https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?ixlib=rb-0.3.5&amp;q=80&amp;fm=jpg&amp;crop=entropy&amp;cs=tinysrgb&amp;w=1080&amp;fit=max&amp;ixid=eyJhcHBfaWQiOjMyMDc0fQ&amp;s=0754ab085804ae8a3b562548e6b4aa2e"/>
//                                                     <div className="card-body">
//                                                         <h4 className="card-title">Special title treatment</h4>
//                                                         <p className="card-text">With supporting text below as a natural lead-in to additional content.</p>

//                                                     </div>
//                                                 </div>
//                                             </div>

//                                         </div>
//                                     </div>
//                                     <div className="carousel-item">
//                                         <div className="row">

//                                             <div className="col-md-4 mb-3">
//                                                 <div className="card">
//                                                     <img className="img-fluid" alt="100%x280" src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-0.3.5&amp;q=80&amp;fm=jpg&amp;crop=entropy&amp;cs=tinysrgb&amp;w=1080&amp;fit=max&amp;ixid=eyJhcHBfaWQiOjMyMDc0fQ&amp;s=ee8417f0ea2a50d53a12665820b54e23"/>
//                                                     <div className="card-body">
//                                                         <h4 className="card-title">Special title treatment</h4>
//                                                         <p className="card-text">With supporting text below as a natural lead-in to additional content.</p>

//                                                     </div>

//                                                 </div>
//                                             </div>
//                                             <div className="col-md-4 mb-3">
//                                                 <div className="card">
//                                                     <img className="img-fluid" alt="100%x280" src="https://images.unsplash.com/photo-1532777946373-b6783242f211?ixlib=rb-0.3.5&amp;q=80&amp;fm=jpg&amp;crop=entropy&amp;cs=tinysrgb&amp;w=1080&amp;fit=max&amp;ixid=eyJhcHBfaWQiOjMyMDc0fQ&amp;s=8ac55cf3a68785643998730839663129"/>
//                                                     <div className="card-body">
//                                                         <h4 className="card-title">Special title treatment</h4>
//                                                         <p className="card-text">With supporting text below as a natural lead-in to additional content.</p>

//                                                     </div>
//                                                 </div>
//                                             </div>
//                                             <div className="col-md-4 mb-3">
//                                                 <div className="card">
//                                                     <img className="img-fluid" alt="100%x280" src="https://images.unsplash.com/photo-1532763303805-529d595877c5?ixlib=rb-0.3.5&amp;q=80&amp;fm=jpg&amp;crop=entropy&amp;cs=tinysrgb&amp;w=1080&amp;fit=max&amp;ixid=eyJhcHBfaWQiOjMyMDc0fQ&amp;s=5ee4fd5d19b40f93eadb21871757eda6"/>
//                                                     <div className="card-body">
//                                                         <h4 className="card-title">Special title treatment</h4>
//                                                         <p className="card-text">With supporting text below as a natural lead-in to additional content.</p>
//                                                     </div>
//                                                 </div>
//                                             </div>
//                                         </div>
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>
//                     </div> */}

// {/* {url.types.map((type, index) => (
//     <p key={index} className="badge rounded-pill text-bg-secondary">{type.type.name}</p>
// ))} */}
// {/* <p className="card-text"><small className="text-body-secondary">Last updated 3 mins ago</small></p> */}

// {/* <div>
//     {url.weakness.map((weakness, index) => isEmpty(weakness) ? (

//         <div key={index}>
//             <h3>{index}</h3>

//             {Object.keys(weakness).map((key, indexx) => isEmpty(key) ? (

//                 <div key={indexx}>
//                     <h5>{key}</h5>

//                     {weakness[key].map((weak, indexxx) => isEmpty(weak) ? (
//                         <p key={indexxx}>
//                             {weak}
//                         </p>

//                     ) : null)}

//                 </div>

//             ) : null)}

//         </div>

//     ) : null)}

// </div> */}

// <p key={"name: " + url.name + " id: " + url.id + " ability: " + url?.abilities[index]?.ability?.name + " key: " + key + " weak: " + weak}>

//  <p className="d-inline-flex gap-1">
//      <a className="btn btn-primary" data-bs-toggle="collapse" href="#collapseExample" role="button" aria-expanded="false" aria-controls="collapseExample">
//          Link with href
//      </a>
//      <button className="btn btn-primary" type="button" data-bs-toggle="collapse" data-bs-target="#collapseExample" aria-expanded="false" aria-controls="collapseExample">
//           Button with data-bs-target
//      </button>
//  </p>
//  <div className="collapse" id="collapseExample">
//      <div className="card card-body">
//          Some placeholder content for the collapse component. This panel is hidden by default but revealed when the user activates the relevant trigger.
//      </div>
//  </div>




    // const [newItem, setNewItem] = useState("");
    // const [items, setItems] = useState([]);

    // const inputRefNewItem = useRef(null)

    // const handlerNewItem = event => setNewItem(String(event.target.value))

    // const handlerButtonAdd = e => {
    //     e.preventDefault()
    //     if(newItem !== null && newItem !== "" && typeof(newItem) === "string"){

    //         const auxNewItem = {
    //             id: Math.floor(Math.random() * (999999999 - 100000000 + 1) + 100000000).toString(),
    //             title: newItem,
    //             selected: false,
    //             createAt: new Date()
    //         }

    //         setItems(oldList => [...oldList , auxNewItem])

    //         setNewItem("")
    //     }

    //     if(inputRefNewItem.current !== null){
    //         inputRefNewItem.current.focus()
    //     }
    // }

    // const handlerKeyDownButtonAdd = (event) => {
    //     if (event.key === 'Enter') {
    //     handlerButtonAdd(event)
    //     }
    // }

    // const handlerButtonMarcar = (id) => {
    //     const newUpdatedItems = items.map(item => {
    //         if(item.id === id){
    //             item.selected = !item.selected
    //         }
    //         return item
    //     })
    //     setItems(newUpdatedItems)
    // }

    // const handlerButtonRemover = (id) => {
    //     const newUpdatedItems = items.filter(item => {
    //         if(item.id === id){
    //             item = null
    //         }
    //         return item
    //     })
    //     setItems(newUpdatedItems)
    // }

    // const handlerClass = (value, className) => value ? className : null

    // const propComparator = (props) => (itemA, itemB) => {

    //     for(const key in props){
    //         const prop = props[key]

    //         if(itemA[prop] > itemB[prop]) return 1

    //         if(itemA[prop] < itemB[prop]) return -1

    //     }

    //     return 0;

    // }

    // const propEventHandle = (value, callback) => (event) => callback(value)

    // const listOfTasksSorted = items.sort(propComparator(["selected", "createAt"]))

    // const renderedTasksList = listOfTasksSorted.map(item => (
    //     <tr key={item.id}>
    //         <td>

    //             <label htmlFor={"checkbox" + item.id}>
    //                 <input onClick={propEventHandle(item.id, handlerButtonMarcar)} type="checkbox" className="form-check-input mt-075" id={"checkbox" + item.id}/>
    //             </label>

    //         </td>
    //         <td className='align-middle w-100'>

    //             <p className={`${handlerClass(item.selected, "cortado")} m-0 p-0`}>
    //                 {item.title}
    //             </p>

    //         </td>
    //         <td className='text-end'>

    //             <button onClick={propEventHandle(item.id, handlerButtonRemover)} className="btn btn-outline-danger">
    //                 <i className="fa-solid fa-trash"></i>
    //             </button>

    //         </td>
    //     </tr>
    // ))

    // return (
    //     <>
    //         <div className="row justify-content-center mb-3">
    //             <div className="col-12 col-lg-8 col-xxl-6 d-flex">
    //                 <div className='flex-grow-1 mx-2'>

    //                     <input type={"text"} value={newItem} onChange={handlerNewItem} onKeyDown={handlerKeyDownButtonAdd} autoFocus={"autofocus"} className={"form-control Input"} placeholder={"Type new item"} ref={inputRefNewItem} />

    //                 </div>
                    
    //                 <button onClick={handlerButtonAdd}type="button"className="btn btn-outline-primary mx-2 Button">
    //                     <i className="fa-solid fa-plus"/>
    //                 </button>

    //             </div>
    //         </div>

    //         <div className="row justify-content-center flex-grow-1 overflow-auto scrollable-content">
    //             <div className="col-12 col-lg-8 col-xxl-6">
    //                 <table className="table">
    //                     <tbody>

    //                         {renderedTasksList}

    //                     </tbody>
    //                 </table>
    //             </div>
    //         </div>
    //     </>
    // );