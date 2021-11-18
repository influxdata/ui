import React, { Component } from 'react';
import VirtualizedSelect from 'react-virtualized-select';
import { Grid, Dropdown } from 'semantic-ui-react';

import 'react-select/dist/react-select.css';
import 'react-virtualized/styles.css';
import 'react-virtualized-select/styles.css';

import { debounce } from 'lodash';

export function generateOptions(size = 0, i = 0, options = []) {
    if (i === size) return options;

    const option = {
        value: i + 1,
        label: i + 1,
    };
    return generateOptions(size, i + 1, [ ...options, option ]);
}

export const OPTIONS = generateOptions(10);

export default class TestSelect extends Component {
    state = {
        page: 1,
    };

    logValue = debounce((typed) => {
        this.setState((prevState, props) => ({
            typed,
        }));
    }, 250);

    setValue = (value) => {
        this.setState((prevState, props) => ({
            value,
        }));
    }

    setPage = (page) => {
        this.setState((prevState, props) => ({
            page,
        }));
    }

    addOptions = () => {
        this.setState((prevState, props) => ({
            isLoading: true,
        }));
        setTimeout(() => {
            this.setState((prevState, props) => ({
                page: this.state.page + 1,
                isLoading: false,
            }));
        }, 1000);
    }

    handleOpen = () => {
        this.setPage(1);
    }

    handleChange = (value) => {
        this.setValue(value);
        this.setPage(0);
    }

    handleInputChange = (value) => {
        this.logValue(value);
        if (value.length === 0) this.setPage(1);
    }

    handleMenuScrollToBottom = () => {
        this.addOptions();
    }

    renderOption = ({
                        focusedOption,
                        focusOption,
                        key,
                        labelKey,
                        option,
                        selectValue,
                        style,
                        valueArray
                    }) => {
        const className = ['VirtualizedSelectOption']

        if (option === focusedOption) {
            className.push('VirtualizedSelectFocusedOption')
        }

        if (option.disabled) {
            className.push('VirtualizedSelectDisabledOption')
        }

        if (valueArray && valueArray.indexOf(option) >= 0) {
            className.push('VirtualizedSelectSelectedOption')
        }

        if (option.className) {
            className.push(option.className)
        }

        const events = option.disabled
            ? {}
            : {
                onClick: () => selectValue(option),
                onMouseEnter: () => focusOption(option)
            };

        if (option.disabled) {
            return (
                <div
                    className={className.join(' ')}
                    key={key}
                    style={style}
                    title={option.title}
                    {...events}
                >
                    <div style={{ textAlign: 'center', width: '100%' }}>
                        <span className="Select-loading" style={{ marginRight: '0.5em' }}></span>
                        <span>{option[labelKey]}</span>
                    </div>
                </div>
            )
        }

        return (
            <div
                className={className.join(' ')}
                key={key}
                style={style}
                title={option.title}
                {...events}
            >
                {option[labelKey]}
            </div>
        )
    } //end renderOption

    render() {
        const { value, page, typed, isLoading } = this.state;
        const options = [
            ...generateOptions(page * 20),
            isLoading ? { value: 'loading', label: 'Loading more...', disabled: true } : {}
        ];

        return (
            <Grid>
                <Grid.Row>
                    <Grid.Column width={16}>
                        <p>
                            <span>Your search query: </span>
                            {typed && <strong>{typed}</strong>}
                            {!typed && '...'}
                        </p>
                        <VirtualizedSelect
                            value={value}
                            options={options}
                            optionRenderer={this.renderOption}
                            onOpen={this.handleOpen}
                            onChange={this.handleChange}
                            onMenuScrollToBottom={this.handleMenuScrollToBottom}
                            onInputChange={this.handleInputChange}
                        />
                        <p></p>
                        {/*
            <Dropdown
              placeholder='Select Number'
              fluid
              search
              selection
              options={options.map(option => ({
                value: option.value,
                text: option.label,
              }))}
            />
            */}
                    </Grid.Column>
                </Grid.Row>
            </Grid>
        );
    }
}
