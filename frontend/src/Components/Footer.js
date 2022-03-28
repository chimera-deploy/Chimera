const developers = [
  { name: "Josh Leath", website: "https://github.com/jleath", image: "../../Josh.jpeg" },
  { name: "Trevor Kelly", website: "https://github.com/TrevorDKelly", image: "../../Trevor.png" },
  { name: "Wes Anderson", website: "https://github.com/w-h-a", image: "../../Wes.png" },
  { name: "Will Rossen", website: "https://github.com/wor101", image: "../../Will.jpeg" }
];

const Developer = ({ name, website, image }) =>{
  return (
    <li className="developer">
      <img src={image} alt={name} className="developer-image" />
      <a href={website}>{name}</a>
    </li>
  );
};

const Footer = () => {
  return (
    <div className="footer">
      <ul>
        {developers.map(dev => {
          return (
            <Developer
              key={dev.name}
              name={dev.name}
              website={dev.website}
              image={dev.image}
            />
          );
        })}
      </ul>
    </div>
  )
};

export default Footer;