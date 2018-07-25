import React from 'react';
import { Menu, Sidebar, Dropdown } from 'semantic-ui-react';

import { NavLink } from 'react-router-dom';
export const NavbarMenu = (props) => <Menu stackable inverted color='grey' size='large' {...props} />
export const SiteMenuHeader = () => <Menu.Item header>StarQuew</Menu.Item>



export const NavItem = ({disabled, ...args}) => <Menu.Item disabled={disabled} as={disabled ? 'a' : NavLink} {...args} />

const pageNavItem = (item, index, Component) => {
    if(item.openModal) {
        const { openModal: ModalClass, modalProps = {}, ...props } = item;
        return <ModalClass trigger={<Component {...props} />} {...modalProps} key={index}/>
    }
    return <Component {...item} key={index} />
}

const pageMenuItems = (rightMenu, itemComponent) => {
    let children = [];
    if(rightMenu.navItems) {
        const menuItems = rightMenu.navItems.map((item, index) => pageNavItem(item, index, itemComponent));
        children = children.concat(menuItems);
    }
    return children;
}

export const NavbarMenuItems = ({disabled, hasConnectedCameras, rightMenu, sectionMenu, onClick = () => true}) => (
    <React.Fragment>
        <NavItem icon='list' content='Sequences' to="/sequences" disabled={disabled} onClick={onClick} />
        <NavItem icon='computer' content='INDI Server' to="/indi" disabled={disabled} onClick={onClick} />
        <NavItem icon='camera' content='Camera' to="/camera" disabled={disabled || ! hasConnectedCameras} onClick={onClick}/>
        <NavItem icon='settings' content='Settings' to="/settings" disabled={disabled} onClick={onClick} />
        { rightMenu && (
            <Menu.Menu position='right'>
                <Dropdown item text={rightMenu.section}>
                    <Dropdown.Menu>
                        {pageMenuItems(rightMenu, Dropdown.Item)}
                    </Dropdown.Menu>
                </Dropdown>
            </Menu.Menu>
        )}
        { sectionMenu && (
            <React.Fragment>
                <Menu.Item header content={sectionMenu.section} />
                {pageMenuItems(sectionMenu, Menu.Item)}
            </React.Fragment>
        )}
    </React.Fragment>
)


