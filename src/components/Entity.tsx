import * as React from "react";
import * as ReactDom from "react-dom";
import { isEmpty, pick, reduce, upperFirst } from "lodash/fp";
//import { Text } from "./Text";
import { Text } from "../spinoffs/Text";
import { Node } from "./Node";
import { EntityProps } from "../typings";
import { Group } from "./Group";
import { Edge } from "./Edge";
import ReactCSSTransitionGroup from "react-addons-css-transition-group";
import * as edgeDrawers from "../drawers/edges/__bundled_dont_edit__";

/**
 * Parent Entity component.
 * Most components share many properties so we "lift state up" to the parent.
 */
export class Entity extends React.Component<any, any> {
  constructor(props: EntityProps) {
    super(props);
  }

  renderText() {
    const { props } = this;
    const { id, textContent, textRotation } = props;
    if (!textContent) return;

    const textPropsToPassDown = [
      "color",
      "fontFamily",
      "fontSize",
      "fontStyle",
      "fontWeight",
      "lineHeight",
      "overflow",
      "textAlign",
      "textContent",
      // Note: not including "textRotation", because we want to
      // pass it down as just "rotation"
      "textOverflow",
      "whiteSpace"
    ];
    const containerPropsToPassDown = [
      "height",
      "id",
      "padding",
      "verticalAlign",
      "width"
    ];
    const seed = pick(textPropsToPassDown, props);
    const propsToPassDown = reduce(
      function(acc, containerPropName) {
        const propName = "container" + upperFirst(containerPropName);
        acc[propName] = props[containerPropName];
        return acc;
      },
      seed,
      containerPropsToPassDown
    );

    return (
      <Text
        id={`text-for-${id}`}
        key={`text-for-${id}`}
        className="textlabel"
        rotation={textRotation}
        {...propsToPassDown}
      />
    );
  }

  renderBurrs() {
    const { props } = this;
    const {
      burrs,
      drawAs: parentDrawAs,
      entityMap,
      getPropsToPassDown,
      height,
      kaavioType,
      points,
      width
    } = props;
    if (!burrs || burrs.length < 1) return;

    return burrs
      .map(burrId => entityMap[burrId])
      .map(burr => {
        // NOTE: notice side effect
        burr.width += 0;
        burr.height += 0;
        const attachmentDisplay = burr.attachmentDisplay;
        const [xFactor, yFactor] = attachmentDisplay.position;
        const [xOffset, yOffset] = "offset" in attachmentDisplay
          ? attachmentDisplay.offset
          : [0, 0];

        // kaavioType is referring to the entity the burr is attached to
        if (["SingleFreeNode", "Group"].indexOf(kaavioType) > -1) {
          burr.x = width * xFactor - burr.width / 2 + xOffset;
          burr.y = height * yFactor - burr.height / 2 + yOffset;
        } else if (kaavioType === "Edge") {
          // TODO get edge logic working so we can position this better
          // TODO look at current production pvjs to see how this is done
          const positionXY = new edgeDrawers[parentDrawAs](
            points
          ).getPointAtPosition(xFactor);
          burr.x = positionXY.x - burr.width / 2 + xOffset;
          burr.y = positionXY.y - burr.height / 2 + yOffset;
        } else {
          throw new Error(
            `Cannot handle burr with parent of type ${kaavioType}`
          );
        }

        return burr;
      })
      .map(burr => {
        // Even though burr.kaavioType = "Node", we render the Burr as a new Entity.
        // If we just render it a Node, we can't do things like individually highlighting the burr.
        return <Entity key={burr.id} {...getPropsToPassDown(props, burr)} />;
      });
  }

  componentWillReceiveProps(nextProps) {
    const { filters } = this.props;
    const { filters: nextFilters, setFilter } = nextProps;
    // TODO use lodash/fp everywhere so this comparison is on immutable
    // data structures.
    if (filters !== nextFilters) {
      nextFilters.forEach(function(nextFilter) {
        setFilter(nextFilter, nextProps);
      });
    }
  }

  render() {
    const { props } = this;
    const {
      getPropsToPassDown,
      color,
      filters,
      getClassString,
      getFilterId,
      height,
      id,
      kaavioType,
      rotation,
      textContent,
      type,
      width,
      x,
      y
    } = props;
    let entityTransform;
    if (x || y || rotation) {
      entityTransform = `translate(${x},${y})`;
      if (rotation) {
        entityTransform += ` rotate(${rotation},${width / 2},${height / 2})`;
      }
    }

    // Anders: I think it's best to be explicit. Instead of using components[kaavioType] do this.
    // I know it's a bit redundant but in this case I think it aids comprehension
    let child;
    switch (kaavioType) {
      case "SingleFreeNode":
        child = <Node {...props} />;
        break;
      case "Burr":
        child = <Node {...props} />;
        break;
      case "Edge":
        child = <Edge {...props} />;
        break;
      case "Group":
        child = <Group {...props} />;
        break;
      default:
        throw new Error(
          "The Kaavio type of " +
            kaavioType +
            " does not exist. Please use one of " +
            "SingleFreeNode, Edge, or Group."
        );
    }

    return (
      <g
        id={id}
        key={id}
        name={textContent}
        className={`kaavio-diagram ${getClassString(type)}`}
        color={color}
        transform={entityTransform}
        typeof={type.join(" ")}
      >
        {/*
        // NOTE: recommendation is to only use one metadata child per element,
				// so if we want multiple RDFa property/content pairs, we could use <g>:
        // https://www.w3.org/TR/SVG/metadata.html#MetadataElement
        <g
          property="biopax:entityReference"
          content="identifiers:ec-code/3.6.3.14"
        />
				// alternatively, we could use regular RDF inside a metadata element:
				<metadata>
					<rdf:RDF
							 xmlns:rdf = "http://www.w3.org/1999/02/22-rdf-syntax-ns#"
							 xmlns:rdfs = "http://www.w3.org/2000/01/rdf-schema#"
							 xmlns:dc = "http://purl.org/dc/elements/1.1/" >
						<rdf:Description about="http://example.org/myfoo"
								 dc:title="MyFoo Financial Report"
								 dc:description="$three $bar $thousands $dollars $from 1998 $through 2000"
								 dc:publisher="Example Organization"
								 dc:date="2000-04-11"
								 dc:format="image/svg+xml"
								 dc:language="en" >
							<dc:creator>
								<rdf:Bag>
									<rdf:li>Irving Bird</rdf:li>
									<rdf:li>Mary Lambert</rdf:li>
								</rdf:Bag>
							</dc:creator>
						</rdf:Description>
					</rdf:RDF>
				</metadata>
				*/}

        {isEmpty(filters)
          ? child
          : filters.reduce(function(acc, filterName) {
              const filterId = getFilterId(filterName, props);
              return (
                <g filter={`url(#${filterId})`}>
                  {acc}
                </g>
              );
            }, child)}

        {this.renderBurrs()}

        {this.renderText()}
      </g>
    );
  }
}
