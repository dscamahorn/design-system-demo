// Sample UI demo: a single card with an avatar, a select field, and a
// Cancel/Okay button group, plus a light/dark theme toggle in the corner.
// This page was generated from the Figma design via the MCP tools and is
// our own code, so it follows the global code style (plain functions,
// if/else instead of ternaries, comments for each step).
import { Card } from "compositions";
import { IconMoon, IconSun } from "icons";
import { Flex } from "layout";
import {
  Avatar,
  Button,
  ButtonGroup,
  IconButton,
  SelectField,
  SelectItem,
} from "primitives";
import { useEffect, useState } from "react";
import "./sample-ui-theme.css";

// The two theme names the page can be in. The CSS in sample-ui-theme.css
// keys off these exact values on the <html> element's data-theme attribute.
type ThemeName = "light" | "dark";

const LIGHT_THEME: ThemeName = "light";
const DARK_THEME: ThemeName = "dark";
const DEFAULT_THEME: ThemeName = LIGHT_THEME;

// Placeholder avatar image used by the demo.
const AVATAR_IMAGE_URL = "https://i.pravatar.cc/80";

// Options shown in the select field. Kept in one list so adding or renaming
// an option is a one-line change instead of another JSX element.
const SELECT_OPTIONS = [
  { id: "value-test", label: "Value test" },
  { id: "hello-world", label: "Hello World" },
  { id: "option-2", label: "Option 2" },
  { id: "option-3", label: "Option 3" },
  { id: "option-4", label: "Option 4" },
  { id: "option-5", label: "Option 5" },
];
const DEFAULT_SELECTED_OPTION_ID = "value-test";

/**
 * Returns the theme that is not currently active, so the toggle knows
 * which theme to switch to and which one to name in its label.
 */
function getOppositeTheme(currentTheme: ThemeName): ThemeName {
  if (currentTheme === LIGHT_THEME) {
    return DARK_THEME;
  } else {
    return LIGHT_THEME;
  }
}

/**
 * Renders the Sample UI page: a theme toggle and one card of form controls.
 */
export function SampleUI() {
  // React state holding the current theme. Calling setTheme re-renders
  // the page with the new value.
  const [theme, setTheme] = useState<ThemeName>(DEFAULT_THEME);

  // Whenever the theme changes, write it onto the <html> element so the CSS
  // in sample-ui-theme.css can switch color variables. useEffect is needed
  // because touching the document is a side effect, not part of rendering.
  useEffect(
    function applyThemeToDocument() {
      document.documentElement.dataset.theme = theme;
    },
    [theme],
  );

  // Work out the toggle's label and icon ahead of time so the JSX below
  // stays free of inline conditionals.
  const oppositeTheme = getOppositeTheme(theme);
  const toggleLabel = "Switch to " + oppositeTheme + " mode";
  let toggleIcon = <IconSun />;
  if (theme === LIGHT_THEME) {
    toggleIcon = <IconMoon />;
  }

  /** Flips the page between light and dark when the toggle is pressed. */
  function handleThemeTogglePress() {
    setTheme(oppositeTheme);
  }

  /** Placeholder for the Cancel button; the demo has nothing to cancel yet. */
  function handleCancelPress() {
    console.log("Cancel");
  }

  /** Placeholder for the Okay button; the demo has nothing to submit yet. */
  function handleOkayPress() {
    console.log("Okay");
  }

  // Build the list of <SelectItem> elements from SELECT_OPTIONS.
  const selectItems = [];
  for (const option of SELECT_OPTIONS) {
    selectItems.push(
      <SelectItem key={option.id} id={option.id}>
        {option.label}
      </SelectItem>,
    );
  }

  return (
    <Flex
      className="sample-ui-viewport"
      alignPrimary="center"
      alignSecondary="center"
      gap="600"
    >
      <IconButton
        className="sample-ui-theme-toggle"
        aria-label={toggleLabel}
        variant="neutral"
        onPress={handleThemeTogglePress}
      >
        {toggleIcon}
      </IconButton>
      <Card variant="stroke" padding="600" direction="vertical">
        <Flex direction="column" gap="600" alignSecondary="stretch">
          {/* The column above stretches every child to full width. Putting
              the avatar in its own row keeps it at its natural size. */}
          <Flex>
            <Avatar
              size="large"
              square
              src={AVATAR_IMAGE_URL}
              alt="User avatar"
            />
          </Flex>
          <Flex direction="column" gap="400" alignSecondary="stretch">
            <SelectField
              label="Label"
              description="Lorem ipsum dolar sit"
              aria-label="Label"
              defaultSelectedKey={DEFAULT_SELECTED_OPTION_ID}
            >
              {selectItems}
            </SelectField>
            <ButtonGroup align="stack">
              <Button variant="neutral" onPress={handleCancelPress}>
                Cancel
              </Button>
              <Button variant="primary" onPress={handleOkayPress}>
                Okay
              </Button>
            </ButtonGroup>
          </Flex>
        </Flex>
      </Card>
    </Flex>
  );
}
