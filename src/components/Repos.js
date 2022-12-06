import React, {useContext} from 'react';
import styled from 'styled-components';
import {GithubContext} from '../context/context';
import {ExampleChart, Pie3D, Column3D, Bar3D, Doughnut2D} from './Charts';

const Repos = () => {
    const {repos} = useContext(GithubContext)

    if (Object.keys(repos).length === 0) {
        return ''
    }

    const languages = repos.reduce((total, item) => {
        const {language, stargazers_count } = item;
        if (!language) {
            return total;
        }
        if (!total[language]) {
            total[language] = {label: language, value: 1, starts: stargazers_count}
        } else {
            total[language] = {
                ...total[language],
                value: total[language].value + 1,
                starts:  total[language].starts + 1
            }
        }

        return total
    }, {});

    const mostUsed = Object.values(languages)
        .sort((a, b) => {
            return b.value - a.value //highest first
        })
        .slice(0, 5) //convert {} -> [] -> sort -> only first 5

    //most starts
    const mostPopular = Object.values(languages).sort((a, b) => {
        return b.start - a.starts
    }).map((item) => {
        return {
            ...item, value: item.starts
        }
    }).slice(0, 5)

    //stars, forks
    let {stars, forks} = repos.reduce((total, item) => {
        const {stargazers_count, name, forks} = item;
        total.stars[stargazers_count] = {
            label: name,
            value: stargazers_count
        }
        total.forks[forks] = {
            label: name,
            value: forks
        }
        return total;
    }, {
        stars: {}, forks: {}
    })

    stars = Object.values(stars).slice(-5).reverse();
    forks = Object.values(forks).slice(-5).reverse();

    return <section className={'section'}>
        <Wrapper className={'section-center'}>
            <Pie3D data={mostUsed}/>
            <Column3D data={stars}></Column3D>
            <Doughnut2D data={mostPopular}/>
            <Bar3D data={forks}></Bar3D>
        </Wrapper>
    </section>
};

const Wrapper = styled.div`
  display: grid;
  justify-items: center;
  gap: 2rem;

  @media (min-width: 800px) {
    grid-template-columns: 1fr 1fr;
  }

  @media (min-width: 1200px) {
    grid-template-columns: 2fr 3fr;
  }

  div {
    width: 100% !important;
  }

  .fusioncharts-container {
    width: 100% !important;
  }

  svg {
    width: 100% !important;
    border-radius: var(--radius) !important;
  }
`;

export default Repos;
