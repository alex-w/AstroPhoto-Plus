import React from 'react';
import { Divider, Menu, Message, Image, Form, Loader } from 'semantic-ui-react';
import fetch from 'isomorphic-fetch'
import { NavbarSectionMenu } from '../Navigation/NavbarMenu';
import { ImageViewOptionsContainer } from './ImageViewOptionsContainer';

export class ImageComponent extends React.Component {
    componentDidUpdate = (prevProps) => this.props.uri !== prevProps.uri && this.props.onImageLoading && this.props.onImageLoading();
    componentDidMount = () => this.props.onImageLoading && this.props.onImageLoading();
    
    render = () => {
        const {uri, fitScreen, onImageLoaded} = this.props;
        let imgProps = onImageLoaded ? { onLoad: onImageLoaded, onError: onImageLoaded } : {};
        return <Image
            alt=''
            src={uri}
            {...imgProps}
            fluid={fitScreen}
            ui={fitScreen}
        />;
    }
}

export class ImageLoader extends React.Component {
    constructor(props) {
        super(props);
        this.state = { loading: false, ready: false, error: false }
        this.exiting = false;
    }

    toggleLoading = (loading) => this.setState({...this.state, loading});
    toggleReady = (ready) => this.setState({...this.state, ready});

    onImageLoading = () => {
        this.toggleLoading(true);
        const { uri, section } = this.props;
        this.props.onImageLoading && this.props.onImageLoading({uri, section});
    }

    onImageLoaded = () => {
        this.toggleLoading(false);
        const { uri, section } = this.props;
        this.props.onImageLoaded && this.props.onImageLoaded({uri, section});
    }

    shouldShowLoader = () => (this.state.loading || ! this.state.ready) && ! this.state.error 
    shouldShowImage = () => this.state.ready && ! this.state.error 

    componentDidMount = async () => {
        try {
            const response = await fetch(`/api/images/${this.props.type}/${this.props.id}/wait_until_ready`);
            if(!response.ok) {
                throw response;
            }
            const json = await response.json();
            if(!json.ready) {
                throw json;
            }
            this.exiting || this.toggleReady(true);
        } catch(response) {
            console.warn('Unable to load image: ', response);
            this.exiting || this.setState({...this.state, error: true});
        }
    }

    render = () => this.exiting ? null : (
        <React.Fragment>
            <Loader active={this.shouldShowLoader()} inverted />
            { this.state.error &&   <Message icon='image' header='Error loading image' content='An error occured while loading the image. Please retry, or check your server logs.' /> }
            { this.shouldShowImage() && <ImageComponent
                {...this.props}
                fitScreen={this.props.options.fitToScreen}
                onImageLoading={this.onImageLoading}
                onImageLoaded={this.onImageLoaded}
            /> }
        </React.Fragment>
    );

    componentWillUnmount = () => this.exiting = true;
}



export const ImageSectionMenu = ({id, history}) => id && (
    <NavbarSectionMenu sectionName='Image'>
        <Form>
            <ImageViewOptionsContainer imageId={id} imageType='main' />
        </Form>
        <Divider />
        <Menu.Item onClick={() => history.goBack() } content='back' icon='arrow left' />
    </NavbarSectionMenu>
);

