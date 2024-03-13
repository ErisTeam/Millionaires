import style from './FriendCall.module.css';
import line from '../LifeLine.module.css';
import { IconPhoneOff } from '@tabler/icons-solidjs';
import Hexagon from '@/Components/Hexagon/Hexagon';

export default () => {
	return (
		<section class={style.container + ' ' + line.lifeLine}>
			<div class={style.friendCall}>
				<ol class={style.messageContainer}>
					<li class={style.message}>
						<p>
							<span>Janusz Skalmar Okojski: </span>
							Jestem furrasem Lorem ipsum dolor sit amet consectetur adipisicing elit. Quis, odit! Molestias ipsam
							deserunt corporis velit at, iure vero nesciunt dolor explicabo odio in iusto odit quas cupiditate nihil
							facilis necessitatibus esse impedit blanditiis ut veniam rem fugiat dignissimos! Omnis sed repellat itaque
							blanditiis pariatur accusamus laboriosam quibusdam dolores, ea, ipsum, modi temporibus dolorem beatae
							rerum harum! Voluptas optio molestias nisi cum placeat necessitatibus consequuntur ratione veniam fugiat,
							aspernatur similique voluptatum eum suscipit veritatis, adipisci repellat perspiciatis? Voluptatum et
							molestias debitis voluptates sunt commodi neque perspiciatis, voluptatem, alias provident labore odit
							molestiae recusandae temporibus repudiandae assumenda enim. Porro consequatur ullam numquam nihil
							laudantium vel hic facere laboriosam alias possimus cum eligendi esse dolorum at explicabo fugiat earum
							officiis iure amet, distinctio officia cumque voluptatem ab sequi? Exercitationem obcaecati pariatur hic
							esse at ut tempore aspernatur labore, voluptas impedit excepturi adipisci, ipsum iure ea minus eius,
							maiores voluptatum. Ab quasi nobis asperiores aperiam libero delectus expedita harum facere dignissimos
							recusandae odit ad officiis dolor quidem accusamus eligendi debitis quod, ducimus quo explicabo nesciunt.
							Ipsam, quam facilis ipsum reiciendis expedita sunt. Facere saepe, facilis a illum, maiores corrupti beatae
							nobis velit sed natus in distinctio? Doloremque explicabo commodi cupiditate provident est pariatur
							impedit nemo cumque consequuntur qui veritatis nostrum nesciunt, placeat blanditiis eveniet exercitationem
							omnis, tempore aut quisquam maxime. Reiciendis quasi aliquam quisquam? Doloribus nam dicta itaque sequi
							aspernatur officia inventore ducimus, fugiat animi provident molestias dolorem laudantium eum libero velit
							consequuntur hic enim doloremque at. Magni, alias enim culpa cum optio eveniet.
						</p>
					</li>
					<li class={style.message}>
						<p>
							<span>Janusz Skalmar Okojski: </span>
							Jestem furrasem Lorem ipsum dolor sit amet consectetur adipisicing elit. Quis, odit! Molestias ipsam
							deserunt corporis velit at, iure vero nesciunt dolor explicabo odio in iusto odit quas cupiditate nihil
							facilis necessitatibus esse impedit blanditiis ut veniam rem fugiat dignissimos! Omnis sed repellat itaque
							blanditiis pariatur accusamus laboriosam quibusdam dolores, ea, ipsum, modi temporibus dolorem beatae
							rerum harum! Voluptas optio molestias nisi cum placeat necessitatibus consequuntur ratione veniam fugiat,
							aspernatur similique voluptatum eum suscipit veritatis, adipisci repellat perspiciatis? Voluptatum et
							molestias debitis voluptates sunt commodi neque perspiciatis, voluptatem, alias provident labore odit
							molestiae recusandae temporibus repudiandae assumenda enim. Porro consequatur ullam numquam nihil
							laudantium vel hic facere laboriosam alias possimus cum eligendi esse dolorum at explicabo fugiat earum
							officiis iure amet, distinctio officia cumque voluptatem ab sequi? Exercitationem obcaecati pariatur hic
							esse at ut tempore aspernatur labore, voluptas impedit excepturi adipisci, ipsum iure ea minus eius,
							maiores voluptatum. Ab quasi nobis asperiores aperiam libero delectus expedita harum facere dignissimos
							recusandae odit ad officiis dolor quidem accusamus eligendi debitis quod, ducimus quo explicabo nesciunt.
							Ipsam, quam facilis ipsum reiciendis expedita sunt. Facere saepe, facilis a illum, maiores corrupti beatae
							nobis velit sed natus in distinctio? Doloremque explicabo commodi cupiditate provident est pariatur
							impedit nemo cumque consequuntur qui veritatis nostrum nesciunt, placeat blanditiis eveniet exercitationem
							omnis, tempore aut quisquam maxime. Reiciendis quasi aliquam quisquam? Doloribus nam dicta itaque sequi
							aspernatur officia inventore ducimus, fugiat animi provident molestias dolorem laudantium eum libero velit
							consequuntur hic enim doloremque at. Magni, alias enim culpa cum optio eveniet.
						</p>
					</li>
				</ol>
				<div class={style.messageInput}>
					<input type="text" placeholder="twoja wiadomosc" />
					<Hexagon />
				</div>
			</div>
			<button class={line.icon + ' ' + style.icon}>
				<IconPhoneOff />
			</button>
		</section>
	);
};
